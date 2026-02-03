# Memory: tech-stack/post-quantum-cryptography-nist

The app implements NIST-standardized post-quantum cryptography (PQC) using the `@noble/post-quantum` library. Supported algorithms:

- **ML-KEM (Kyber)**: NIST FIPS 203 - Key Encapsulation Mechanism (levels 768/1024)
- **ML-DSA (Dilithium)**: NIST FIPS 204 - Digital Signature Algorithm (levels 65/87)
- **SLH-DSA (SPHINCS+)**: NIST FIPS 205 - Stateless hash-based signatures

Key files:
- `src/utils/postQuantumCrypto.ts` - Core PQC utility with secure channel implementation (ML-KEM + AES-256)
- `src/components/security/NISTPostQuantumDemo.tsx` - Interactive demo for key generation, signing, and encapsulation
- `src/components/security/QuantumSecurityDashboard.tsx` - Primary "NIST PQC" tab showcasing quantum resistance

This aligns Bible.fi with future-proof security standards ahead of Ethereum's post-quantum transition.
