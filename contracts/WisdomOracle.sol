// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title  WisdomOracle
 * @notice On-chain Scripture oracle for BibleFi.
 *
 *         "For the LORD giveth wisdom: out of his mouth cometh knowledge
 *          and understanding." — Proverbs 2:6 (KJV)
 *
 *         Every financial decision in the BibleFi protocol is anchored to
 *         Scripture. This contract stores the canonical Scripture-to-decision
 *         mappings used by BWTYACore, BibleFiSuperfluid, and downstream
 *         sovereign agents. Governance (the DAO) may update citations; the
 *         tithe rate and its Scripture anchor are immutable at the protocol
 *         level.
 *
 * Architecture
 * ────────────
 * • Each FinancialDecision maps to a ScriptureRef containing:
 *     - book / chapter / verse  (human-readable)
 *     - strongsH / strongsG     (Strong's Concordance numbers)
 *     - languageSource           (KJV / Hebrew / Greek / Aramaic)
 *     - canonicalText            (on-chain KJV text)
 *
 * • Tithe rate validation:
 *     validateTitheRate(rate) → reverts if rate ≠ 1000 bp (10%)
 *     This is an on-chain enforcement of Leviticus 27:30 / Malachi 3:10.
 *
 * • Yield guidance:
 *     getYieldGuidance(pool) → returns the parable backing that pool
 *
 * • Governance-controlled citation updates via owner / future DAO multisig.
 */

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract WisdomOracle is Ownable {

    // ─── Types ────────────────────────────────────────────────────────────────

    enum LanguageSource { KJV, HEBREW, GREEK, ARAMAIC }

    /// @notice A single Scripture reference with Strong's Concordance metadata.
    struct ScriptureRef {
        string  book;           // e.g. "Leviticus"
        uint16  chapter;        // e.g. 27
        uint16  verse;          // e.g. 30
        uint16  verseEnd;       // for ranges; equals verse if single verse
        uint32  strongsH;       // Hebrew Strong's number (OT); 0 if N/A
        uint32  strongsG;       // Greek Strong's number  (NT); 0 if N/A
        LanguageSource lang;    // primary source language
        string  canonicalText;  // KJV canonical text, stored on-chain
    }

    /// @notice Financial decision categories governed by Scripture.
    enum FinancialDecision {
        TITHE,              // Leviticus 27:30 / Malachi 3:10
        FIRSTFRUITS,        // Proverbs 3:9
        ANONYMOUS_GIVING,   // Matthew 6:3
        TALENTS_YIELD,      // Matthew 25:14-30
        JOSEPHS_STOREHOUSE, // Genesis 41:29-36
        SOLOMONS_TREASURY,  // 1 Kings 10:23 / Proverbs 8:18
        SABBATH_REST,       // Exodus 20:8-11
        DEBT_AVOIDANCE,     // Proverbs 22:7
        GENEROSITY,         // 2 Corinthians 9:7
        STEWARDSHIP         // Luke 16:10
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @notice Maps each financial decision to its primary Scripture reference.
    mapping(FinancialDecision => ScriptureRef) private _scripture;

    /// @notice Immutable tithe rate — 1000 basis points = 10%.
    ///         Validated against Scripture; cannot be changed by governance.
    uint256 public constant TITHE_RATE_BPS = 1_000;

    /// @notice Minimum acceptable pool APY (basis points) — no yield below this.
    ///         "The worker deserves his wages." (Luke 10:7)
    uint256 public constant MIN_POOL_APY_BPS = 100; // 1%

    /// @notice Maximum stewardship multiplier — 2× APY cap.
    ///         "Well done, good and faithful servant!" (Matthew 25:21)
    uint256 public constant MAX_STEWARDSHIP_MULTIPLIER = 200; // 2.00×

    // ─── Events ───────────────────────────────────────────────────────────────

    event ScriptureRefUpdated(
        FinancialDecision indexed decision,
        string book,
        uint16 chapter,
        uint16 verse,
        string text
    );
    event TitheRateValidated(uint256 rateBps, bool valid);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error InvalidTitheRate(uint256 given, uint256 required);
    error EmptyCanonicalText();
    error InvalidChapter();
    error InvalidVerse();

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() {
        _seedCanonicalScriptures();
    }

    // ─── Public oracle interface ───────────────────────────────────────────────

    /**
     * @notice Returns the Scripture reference governing a financial decision.
     * @param decision The financial decision category.
     */
    function getScripture(FinancialDecision decision)
        external
        view
        returns (ScriptureRef memory)
    {
        return _scripture[decision];
    }

    /**
     * @notice Returns the KJV canonical text for a financial decision.
     */
    function getCanonicalText(FinancialDecision decision)
        external
        view
        returns (string memory)
    {
        return _scripture[decision].canonicalText;
    }

    /**
     * @notice Returns the Strong's Concordance reference for a decision.
     */
    function getStrongsRef(FinancialDecision decision)
        external
        view
        returns (uint32 strongsH, uint32 strongsG, LanguageSource lang)
    {
        ScriptureRef memory ref = _scripture[decision];
        return (ref.strongsH, ref.strongsG, ref.lang);
    }

    /**
     * @notice Validates that a proposed tithe rate matches the Biblical mandate.
     *         Reverts with the Malachi 3:10 anchor if the rate is wrong.
     *
     * @param proposedRateBps Rate in basis points. Must equal TITHE_RATE_BPS (1000).
     */
    function validateTitheRate(uint256 proposedRateBps) external {
        bool valid = (proposedRateBps == TITHE_RATE_BPS);
        emit TitheRateValidated(proposedRateBps, valid);
        if (!valid) {
            revert InvalidTitheRate(proposedRateBps, TITHE_RATE_BPS);
        }
    }

    /**
     * @notice Returns the Scripture-backed yield guidance for a BWTYA pool.
     * @param poolId  0=Talents, 1=Joseph's Storehouse, 2=Solomon's Treasury, 3=Sabbath Rest
     */
    function getYieldGuidance(uint8 poolId)
        external
        view
        returns (
            ScriptureRef memory scripture,
            uint256 stewardshipMultiplierCap,
            uint256 minApyBps
        )
    {
        FinancialDecision decision;
        if      (poolId == 0) decision = FinancialDecision.TALENTS_YIELD;
        else if (poolId == 1) decision = FinancialDecision.JOSEPHS_STOREHOUSE;
        else if (poolId == 2) decision = FinancialDecision.SOLOMONS_TREASURY;
        else                  decision = FinancialDecision.SABBATH_REST;

        return (
            _scripture[decision],
            MAX_STEWARDSHIP_MULTIPLIER,
            MIN_POOL_APY_BPS
        );
    }

    /**
     * @notice Computes a Scripture-validated APY for a user given their
     *         stewardship score. Caps at MAX_STEWARDSHIP_MULTIPLIER × baseApy.
     *
     * @param baseApyBps        Pool base APY in basis points
     * @param stewardshipScore  0–10000 normalized stewardship score (Talent Protocol)
     * @return effectiveApyBps  Adjusted APY, capped at 2× base
     */
    function computeEffectiveApy(
        uint256 baseApyBps,
        uint256 stewardshipScore
    ) external pure returns (uint256 effectiveApyBps) {
        // Stewardship score 0–10000; scale multiplier 100–200 (1.00×–2.00×)
        uint256 multiplier = 100 + (stewardshipScore * 100) / 10_000;
        if (multiplier > MAX_STEWARDSHIP_MULTIPLIER) {
            multiplier = MAX_STEWARDSHIP_MULTIPLIER;
        }
        effectiveApyBps = (baseApyBps * multiplier) / 100;
        if (effectiveApyBps < MIN_POOL_APY_BPS) {
            effectiveApyBps = MIN_POOL_APY_BPS;
        }
    }

    // ─── Governance ───────────────────────────────────────────────────────────

    /**
     * @notice Governance-controlled citation update. The DAO may update the
     *         canonical text (e.g. adding Aramaic source notes) but may NOT
     *         change TITHE_RATE_BPS — that is enforced at the contract level.
     */
    function updateScriptureRef(
        FinancialDecision decision,
        ScriptureRef calldata ref
    ) external onlyOwner {
        if (bytes(ref.canonicalText).length == 0) revert EmptyCanonicalText();
        if (ref.chapter == 0)                      revert InvalidChapter();
        if (ref.verse == 0)                        revert InvalidVerse();
        _scripture[decision] = ref;
        emit ScriptureRefUpdated(decision, ref.book, ref.chapter, ref.verse, ref.canonicalText);
    }

    // ─── Internal seed ────────────────────────────────────────────────────────

    function _seedCanonicalScriptures() internal {
        _scripture[FinancialDecision.TITHE] = ScriptureRef({
            book:          "Malachi",
            chapter:       3,
            verse:         10,
            verseEnd:      10,
            strongsH:      4643,   // H4643 = maaser (tithe)
            strongsG:      0,
            lang:          LanguageSource.HEBREW,
            canonicalText: "Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it."
        });

        _scripture[FinancialDecision.FIRSTFRUITS] = ScriptureRef({
            book:          "Proverbs",
            chapter:       3,
            verse:         9,
            verseEnd:      9,
            strongsH:      7225,   // H7225 = reshith (firstfruits/beginning)
            strongsG:      0,
            lang:          LanguageSource.HEBREW,
            canonicalText: "Honour the LORD with thy substance, and with the firstfruits of all thine increase."
        });

        _scripture[FinancialDecision.ANONYMOUS_GIVING] = ScriptureRef({
            book:          "Matthew",
            chapter:       6,
            verse:         3,
            verseEnd:      4,
            strongsH:      0,
            strongsG:      2192,   // G2192 = echo (have, hold)
            lang:          LanguageSource.GREEK,
            canonicalText: "But when thou doest alms, let not thy left hand know what thy right hand doeth: That thine alms may be in secret: and thy Father which seeth in secret himself shall reward thee openly."
        });

        _scripture[FinancialDecision.TALENTS_YIELD] = ScriptureRef({
            book:          "Matthew",
            chapter:       25,
            verse:         14,
            verseEnd:      30,
            strongsH:      0,
            strongsG:      5007,   // G5007 = talanton (talent)
            lang:          LanguageSource.GREEK,
            canonicalText: "For the kingdom of heaven is as a man travelling into a far country, who called his own servants, and delivered unto them his goods... Well done, thou good and faithful servant: thou hast been faithful over a few things, I will make thee ruler over many things."
        });

        _scripture[FinancialDecision.JOSEPHS_STOREHOUSE] = ScriptureRef({
            book:          "Genesis",
            chapter:       41,
            verse:         29,
            verseEnd:      36,
            strongsH:      7651,   // H7651 = sheba (seven)
            strongsG:      0,
            lang:          LanguageSource.HEBREW,
            canonicalText: "Behold, there come seven years of great plenty throughout all the land of Egypt: And there shall arise after them seven years of famine... and that food shall be for store to the land against the seven years of famine."
        });

        _scripture[FinancialDecision.SOLOMONS_TREASURY] = ScriptureRef({
            book:          "Proverbs",
            chapter:       8,
            verse:         18,
            verseEnd:      19,
            strongsH:      6239,   // H6239 = osher (riches)
            strongsG:      0,
            lang:          LanguageSource.HEBREW,
            canonicalText: "Riches and honour are with me; yea, durable riches and righteousness. My fruit is better than gold, yea, than fine gold; and my revenue than choice silver."
        });

        _scripture[FinancialDecision.SABBATH_REST] = ScriptureRef({
            book:          "Exodus",
            chapter:       20,
            verse:         8,
            verseEnd:      11,
            strongsH:      7676,   // H7676 = shabbat (Sabbath)
            strongsG:      0,
            lang:          LanguageSource.HEBREW,
            canonicalText: "Remember the sabbath day, to keep it holy. Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy God: in it thou shalt not do any work."
        });

        _scripture[FinancialDecision.DEBT_AVOIDANCE] = ScriptureRef({
            book:          "Proverbs",
            chapter:       22,
            verse:         7,
            verseEnd:      7,
            strongsH:      3867,   // H3867 = lavah (to borrow/lend)
            strongsG:      0,
            lang:          LanguageSource.HEBREW,
            canonicalText: "The rich ruleth over the poor, and the borrower is servant to the lender."
        });

        _scripture[FinancialDecision.GENEROSITY] = ScriptureRef({
            book:          "2 Corinthians",
            chapter:       9,
            verse:         7,
            verseEnd:      7,
            strongsH:      0,
            strongsG:      2431,   // G2431 = hilaros (cheerful)
            lang:          LanguageSource.GREEK,
            canonicalText: "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver."
        });

        _scripture[FinancialDecision.STEWARDSHIP] = ScriptureRef({
            book:          "Luke",
            chapter:       16,
            verse:         10,
            verseEnd:      10,
            strongsH:      0,
            strongsG:      4103,   // G4103 = pistos (faithful)
            lang:          LanguageSource.GREEK,
            canonicalText: "He that is faithful in that which is least is faithful also in much: and he that is unjust in the least is unjust also in much."
        });
    }
}
