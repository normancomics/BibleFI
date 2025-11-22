// Private Tithe Circuit
// Proves: User tithed at least minimum amount to a verified church
// Without revealing: Exact tithe amount or donor identity

use dep::std;

// Main circuit function
fn main(
    // Private inputs (not revealed on-chain)
    tithe_amount: Field,        // Actual tithe amount in wei
    donor_secret: Field,        // Secret known only to donor (like a nullifier seed)
    
    // Public inputs (revealed on-chain)
    min_threshold: pub Field,   // Minimum tithe amount (e.g., $10 in USDC)
    church_id: pub Field,       // Hash of church address
    commitment: pub Field        // Hash commitment for this tithe
) {
    // 1. Verify tithe amount meets minimum threshold
    assert(tithe_amount >= min_threshold);
    
    // 2. Compute commitment to verify it matches the public one
    // This prevents proof reuse and ties proof to specific transaction
    let computed_commitment = std::hash::pedersen_hash([tithe_amount, donor_secret, church_id]);
    assert(commitment == computed_commitment[0]);
    
    // 3. Verify tithe amount is reasonable (not overflow)
    // Max 1 billion USDC (6 decimals) = 1e15 wei
    assert(tithe_amount < 1000000000000000);
    
    // 4. Verify church_id is non-zero (valid church)
    assert(church_id != 0);
}
