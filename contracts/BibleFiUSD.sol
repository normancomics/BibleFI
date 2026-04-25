// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title IMorphoVault
 * @notice Minimal interface for depositing into a Morpho vault
 */
interface IMorphoVault {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function convertToAssets(uint256 shares) external view returns (uint256 assets);
}

/**
 * @title BibleFiUSD
 * @notice OUSD-style yield-bearing stablecoin with Morpho vault integration and 10% auto tithe
 * @dev ERC4626 vault accepting USDC on Base Mainnet; daily rebase mints 10% of yield to charity
 *
 * "Bring ye all the tithes into the storehouse" - Malachi 3:10
 *
 * Features:
 * - Accepts USDC deposits and routes them to a Morpho vault for yield
 * - Mints BFiUSD shares proportional to deposited assets
 * - Daily rebase: 10% (TITHE_BPS) of accrued yield is auto-tithed to charityWallet
 * - Scripture notes recorded on every deposit event for on-chain transparency
 * - Owner can update the Morpho vault address
 */
contract BibleFiUSD is ERC20, ERC4626, ReentrancyGuard, Ownable2Step {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice USDC on Base Mainnet
    address public immutable USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    /// @notice Tithe percentage in basis points (1000 = 10%)
    uint256 public constant TITHE_BPS = 1000;

    /// @notice Scripture reference embedded in every rebase event
    string public constant SCRIPTURE = "Malachi 3:10 - Bring the full tithe into the storehouse";

    // ============ State ============

    /// @notice Active Morpho vault used for yield generation
    address public morphoVault;

    /// @notice Recipient of the 10% auto-tithe
    address public charityWallet;

    /// @notice Timestamp of the last rebase; enforces once-per-day cadence
    uint256 public lastRebase;

    // ============ Events ============

    event Deposited(address indexed user, uint256 assets, uint256 shares, string note);
    event Rebased(uint256 yield, uint256 tithe, string scripture);
    event CharityWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event MorphoVaultUpdated(address indexed oldVault, address indexed newVault);

    // ============ Constructor ============

    /**
     * @param _morphoVault  Morpho vault address on Base Mainnet
     * @param _charity      Charity / Gnosis Safe wallet that receives the 10% tithe
     * @param _owner        Initial contract owner (2-step transfer)
     */
    constructor(address _morphoVault, address _charity, address _owner)
        ERC20("BibleFi USD", "BFiUSD")
        ERC4626(IERC20(USDC))
    {
        require(_morphoVault != address(0), "BibleFiUSD: zero vault");
        require(_charity != address(0), "BibleFiUSD: zero charity");
        require(_owner != address(0), "BibleFiUSD: zero owner");
        morphoVault = _morphoVault;
        charityWallet = _charity;
        _transferOwnership(_owner);
        lastRebase = block.timestamp;
    }

    // ============ External: Deposit ============

    /**
     * @notice Deposit USDC, route it to the Morpho vault, and mint BFiUSD shares.
     * @param assets   Amount of USDC (6 decimals) to deposit
     * @param userNote Optional scripture or personal note logged in the Deposited event
     * @return shares  Amount of BFiUSD minted
     */
    function depositUSDC(uint256 assets, string calldata userNote)
        external
        nonReentrant
        returns (uint256 shares)
    {
        require(assets >= 1e6, "BibleFiUSD: minimum 1 USDC");

        IERC20(USDC).safeTransferFrom(msg.sender, address(this), assets);

        // Approve and deposit into Morpho vault
        IERC20(USDC).forceApprove(morphoVault, assets);
        IMorphoVault(morphoVault).deposit(assets, address(this));

        shares = previewDeposit(assets);
        _mint(msg.sender, shares);

        emit Deposited(msg.sender, assets, shares, userNote);
    }

    // ============ External: Rebase ============

    /**
     * @notice Rebase yield from the Morpho vault and auto-tithe 10% to charityWallet.
     * @dev    Callable once per day by any address. Mints yield tokens rather than transferring
     *         underlying assets, keeping the vault accounting intact.
     */
    function rebaseAndTithe() external nonReentrant {
        require(block.timestamp >= lastRebase + 1 days, "BibleFiUSD: daily only");

        // Total assets: USDC held directly + vault shares converted to underlying assets
        uint256 vaultShares = IERC20(morphoVault).balanceOf(address(this));
        uint256 vaultAssets = vaultShares > 0
            ? IMorphoVault(morphoVault).convertToAssets(vaultShares)
            : 0;
        uint256 totalAssets_ = IERC20(USDC).balanceOf(address(this)) + vaultAssets;
        uint256 supply = totalSupply();

        if (totalAssets_ > supply) {
            uint256 yield_ = totalAssets_ - supply;
            uint256 tithe = (yield_ * TITHE_BPS) / 10000;

            if (tithe > 0) {
                _mint(charityWallet, tithe);
            }
            // Retained yield remains in vault assets, automatically increasing share value

            emit Rebased(yield_, tithe, SCRIPTURE);
        }

        lastRebase = block.timestamp;
    }

    // ============ Owner: Configuration ============

    /**
     * @notice Update the Morpho vault address.
     * @param newVault New vault address (must be non-zero)
     */
    function setMorphoVault(address newVault) external onlyOwner {
        require(newVault != address(0), "BibleFiUSD: zero vault");
        emit MorphoVaultUpdated(morphoVault, newVault);
        morphoVault = newVault;
    }

    /**
     * @notice Update the charity wallet that receives the 10% tithe.
     * @param newCharity New charity address (must be non-zero)
     */
    function setCharityWallet(address newCharity) external onlyOwner {
        require(newCharity != address(0), "BibleFiUSD: zero charity");
        emit CharityWalletUpdated(charityWallet, newCharity);
        charityWallet = newCharity;
    }

    // ============ ERC4626 Overrides ============

    /**
     * @dev Returns the underlying asset (USDC).
     */
    function asset() public view override(ERC4626) returns (address) {
        return USDC;
    }

    /**
     * @dev BFiUSD matches USDC's 6-decimal precision.
     */
    function decimals() public pure override(ERC20, ERC4626) returns (uint8) {
        return 6;
    }
}
