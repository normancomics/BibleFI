// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BibleToken
 * @dev ERC20 token for Bible.Fi DeFi platform with biblical principles
 * Features:
 * - 10% transaction fee goes to treasury for church partnerships
 * - Wisdom-based staking rewards
 * - Anti-whale mechanisms
 * - Burnable supply for deflationary mechanics
 */
contract BibleToken is ERC20, ERC20Burnable, Pausable, Ownable {
    
    // Treasury wallet for church partnerships and platform development
    address public treasury;
    
    // Fee structure (in basis points, 1000 = 10%)
    uint256 public transferFeeRate = 1000; // 10% fee
    uint256 public constant MAX_FEE_RATE = 1000; // Maximum 10% fee
    
    // Anti-whale mechanism
    uint256 public maxTransferAmount;
    uint256 public maxWalletAmount;
    
    // Exemptions from fees and limits
    mapping(address => bool) public feeExempt;
    mapping(address => bool) public limitExempt;
    
    // Wisdom staking tracker
    mapping(address => uint256) public wisdomScore;
    
    // Events
    event TreasuryUpdated(address indexed newTreasury);
    event FeeRateUpdated(uint256 newRate);
    event WisdomScoreUpdated(address indexed user, uint256 newScore);
    event ChurchDonation(address indexed church, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        address _treasury
    ) ERC20(name, symbol) {
        require(_treasury != address(0), "Treasury cannot be zero address");
        
        treasury = _treasury;
        
        // Set limits (2% of total supply for anti-whale)
        maxTransferAmount = (totalSupply * 2) / 100;
        maxWalletAmount = (totalSupply * 2) / 100;
        
        // Mint total supply to owner for initial distribution
        _mint(msg.sender, totalSupply);
        
        // Exempt owner and treasury from fees and limits
        feeExempt[msg.sender] = true;
        feeExempt[_treasury] = true;
        limitExempt[msg.sender] = true;
        limitExempt[_treasury] = true;
        limitExempt[address(0)] = true; // Exempt burn address
    }
    
    /**
     * @dev Override transfer to implement fees and limits
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(!paused(), "ERC20Pausable: token transfer while paused");
        
        // Check limits for non-exempt addresses
        if (!limitExempt[from] && !limitExempt[to]) {
            require(amount <= maxTransferAmount, "Transfer amount exceeds limit");
            require(balanceOf(to) + amount <= maxWalletAmount, "Wallet limit exceeded");
        }
        
        // Calculate fees
        uint256 transferAmount = amount;
        uint256 feeAmount = 0;
        
        // Apply fees if neither address is exempt
        if (!feeExempt[from] && !feeExempt[to] && transferFeeRate > 0) {
            feeAmount = (amount * transferFeeRate) / 10000;
            transferAmount = amount - feeAmount;
            
            // Send fee to treasury
            if (feeAmount > 0) {
                super._transfer(from, treasury, feeAmount);
            }
        }
        
        // Execute main transfer
        super._transfer(from, to, transferAmount);
    }
    
    /**
     * @dev Update treasury address (only owner)
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Treasury cannot be zero address");
        
        // Remove exemptions from old treasury
        feeExempt[treasury] = false;
        limitExempt[treasury] = false;
        
        // Set new treasury
        treasury = _newTreasury;
        
        // Add exemptions to new treasury
        feeExempt[_newTreasury] = true;
        limitExempt[_newTreasury] = true;
        
        emit TreasuryUpdated(_newTreasury);
    }
    
    /**
     * @dev Update transfer fee rate (only owner)
     */
    function updateFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= MAX_FEE_RATE, "Fee rate too high");
        transferFeeRate = _newRate;
        emit FeeRateUpdated(_newRate);
    }
    
    /**
     * @dev Update anti-whale limits (only owner)
     */
    function updateLimits(uint256 _maxTransfer, uint256 _maxWallet) external onlyOwner {
        require(_maxTransfer >= totalSupply() / 1000, "Max transfer too low"); // Min 0.1%
        require(_maxWallet >= totalSupply() / 1000, "Max wallet too low"); // Min 0.1%
        
        maxTransferAmount = _maxTransfer;
        maxWalletAmount = _maxWallet;
    }
    
    /**
     * @dev Set fee exemption status (only owner)
     */
    function setFeeExempt(address account, bool exempt) external onlyOwner {
        feeExempt[account] = exempt;
    }
    
    /**
     * @dev Set limit exemption status (only owner)
     */
    function setLimitExempt(address account, bool exempt) external onlyOwner {
        limitExempt[account] = exempt;
    }
    
    /**
     * @dev Update user's wisdom score (only owner - will be automated via oracle)
     */
    function updateWisdomScore(address user, uint256 score) external onlyOwner {
        wisdomScore[user] = score;
        emit WisdomScoreUpdated(user, score);
    }
    
    /**
     * @dev Donate directly to a church (fee-free transaction)
     */
    function donateToChurch(address church, uint256 amount) external {
        require(church != address(0), "Invalid church address");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Direct transfer without fees (church donation)
        super._transfer(msg.sender, church, amount);
        emit ChurchDonation(church, amount);
    }
    
    /**
     * @dev Pause token transfers (only owner)
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers (only owner)
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get current fee for a transfer amount
     */
    function calculateFee(uint256 amount, address from, address to) 
        external 
        view 
        returns (uint256) 
    {
        if (feeExempt[from] || feeExempt[to] || transferFeeRate == 0) {
            return 0;
        }
        return (amount * transferFeeRate) / 10000;
    }
}