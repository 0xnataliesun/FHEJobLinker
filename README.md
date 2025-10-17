# FHEJobLinker

> A privacy-preserving job matching platform powered by Fully Homomorphic Encryption (FHE)

FHEJobLinker is a decentralized application (dApp) that revolutionizes recruitment by enabling private job matching on blockchain. Job seekers can apply to positions without revealing their salary expectations or location to employers until a match is confirmed through encrypted computation.

[![License](https://img.shields.io/badge/License-BSD_3--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![Zama FHEVM](https://img.shields.io/badge/Powered%20by-Zama%20FHEVM-purple)](https://www.zama.ai/)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why FHEJobLinker?](#why-fhejoblinker)
- [Problems Solved](#problems-solved)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Installation](#installation)
- [Usage](#usage)
- [Smart Contract Documentation](#smart-contract-documentation)
- [Security Considerations](#security-considerations)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

FHEJobLinker leverages **Fully Homomorphic Encryption (FHE)** to create a trustless job marketplace where:

- **Job seekers** register with encrypted salary expectations and location data
- **Employers** post job openings with public criteria
- **Smart contracts** evaluate candidate-job fit using encrypted computation
- **Privacy is preserved** throughout the entire matching process

The platform is built on Ethereum (Sepolia testnet) using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine), enabling computation on encrypted data without ever decrypting it on-chain.

---

## Key Features

### 1. Privacy-First Profile Registration
- Users register with **encrypted salary expectations** and **encrypted location** (country ID)
- Sensitive data remains encrypted on-chain, viewable only by the user
- Uses Zama's FHE SDK for client-side encryption before submission

### 2. Public Job Listings
- Employers create job postings with transparent requirements (location, salary offer)
- No encryption needed for job criteria, ensuring transparency for applicants
- Job listings include metadata: creator address, location, salary offer, applicant count

### 3. Encrypted Candidate Evaluation
- Employers can evaluate applicants using **homomorphic computation**
- The smart contract compares:
  - **Country match**: Does applicant's encrypted country equal job's country?
  - **Salary compatibility**: Is applicant's encrypted expected salary ≤ offered salary?
- Evaluation results are encrypted; only the evaluator can decrypt them

### 4. Zero-Knowledge Matching
- Match results (YES/NO) are returned as encrypted boolean values
- Employers learn only whether an applicant meets criteria, not their actual data
- Applicants maintain privacy even when rejected

### 5. Decentralized Profile Management
- Users can view and decrypt their own profile data using EIP-712 signatures
- No central authority holds decryption keys
- Self-sovereign identity model

### 6. Wallet-Based Authentication
- Seamless Web3 wallet integration (MetaMask, WalletConnect, etc.)
- No traditional login/password required
- Address-based identity system

---

## Why FHEJobLinker?

### The Privacy Problem in Recruitment

Traditional job platforms expose sensitive information:
- Salary expectations visible to all employers (negotiation disadvantage)
- Location data tracked and sold to third parties
- Application history aggregated for profiling
- Centralized databases vulnerable to breaches

### The FHE Solution

**Fully Homomorphic Encryption** allows computation on encrypted data without decryption:
```
Encrypted(Salary A) ≤ Encrypted(Salary B) → Encrypted(TRUE/FALSE)
```

This enables:
- **Computation without exposure**: Match candidates without revealing their data
- **Trustless evaluation**: Smart contracts enforce fair matching rules
- **Blockchain transparency**: All operations auditable, results verifiable
- **No trusted intermediaries**: No platform can access raw user data

---

## Problems Solved

### 1. Information Asymmetry
**Problem**: Employers see applicants' salary expectations before making offers, leading to lowball offers.

**Solution**: Salary expectations remain encrypted. Employers only learn if an applicant's expectations are within budget, not the exact amount.

### 2. Data Privacy Violations
**Problem**: Centralized job platforms collect, sell, and leak user data (2023: 220M+ records breached in recruitment sector).

**Solution**: Encrypted data stored on-chain. Only users hold decryption keys. No central honeypot for hackers.

### 3. Discrimination Risk
**Problem**: Location data can lead to geographic discrimination in hiring.

**Solution**: Encrypted location matching prevents bias while ensuring job-location fit. Employers verify compatibility without seeing exact location until match.

### 4. Platform Trust Issues
**Problem**: Users must trust centralized platforms to handle data responsibly and match fairly.

**Solution**: Smart contract logic is public and immutable. Matching algorithms are transparent and verifiable on-chain.

### 5. Cross-Border Recruitment Complexity
**Problem**: International hiring involves complex privacy regulations (GDPR, CCPA, etc.).

**Solution**: Encrypted data model simplifies compliance—data is cryptographically protected by default.

---

## Technology Stack

### Blockchain & Smart Contracts
| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | ^0.8.24 | Smart contract programming language |
| **Hardhat** | ^2.26.0 | Ethereum development environment |
| **FHEVM (Zama)** | ^0.8.0 | FHE-enabled smart contract library |
| **@fhevm/solidity** | ^0.8.0 | Solidity FHE primitives (euint32, ebool) |
| **Ethers.js** | ^6.15.0 | Ethereum library for blockchain interaction |
| **TypeChain** | ^8.3.2 | TypeScript bindings for contracts |
| **Hardhat Deploy** | ^0.11.45 | Deployment management |

### Frontend Application
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^19.1.1 | UI framework |
| **TypeScript** | ^5.8.3 | Type-safe JavaScript |
| **Vite** | ^7.1.6 | Fast build tool and dev server |
| **Wagmi** | ^2.17.0 | React hooks for Ethereum |
| **Viem** | ^2.37.6 | Lightweight Ethereum library |
| **RainbowKit** | ^2.2.8 | Wallet connection UI |
| **React Query** | ^5.89.0 | Async state management |
| **@zama-fhe/relayer-sdk** | ^0.2.0 | FHE encryption/decryption client |

### Testing & Development
| Technology | Version | Purpose |
|------------|---------|---------|
| **Mocha** | ^11.7.1 | Test framework |
| **Chai** | ^4.5.0 | Assertion library |
| **Hardhat Network** | - | Local Ethereum simulator |
| **Solidity Coverage** | ^0.8.16 | Code coverage analysis |
| **ESLint** | ^8.57.1 | Code linting |
| **Prettier** | ^3.6.2 | Code formatting |

### Network
- **Sepolia Testnet**: Primary deployment network (Ethereum test network with FHEVM support)
- **Local Hardhat Network**: Development and testing environment

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Registration │  │  JobManager  │  │   Profile    │          │
│  │  Component   │  │  Component   │  │  Component   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐         │
│  │         Wagmi + RainbowKit (Web3 Connection)       │         │
│  └─────────────────────────┬──────────────────────────┘         │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐         │
│  │      Zama FHE SDK (Encryption/Decryption)          │         │
│  └─────────────────────────┬──────────────────────────┘         │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Ethereum Blockchain (Sepolia)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              JobLinker Smart Contract                     │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  User Profiles (mapping)                           │  │  │
│  │  │  - name: string (plaintext)                        │  │  │
│  │  │  - country: euint32 (encrypted)                    │  │  │
│  │  │  - expectedSalary: euint32 (encrypted)             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Jobs (mapping)                                    │  │  │
│  │  │  - id: uint256                                     │  │  │
│  │  │  - creator: address                                │  │  │
│  │  │  - country: uint32 (plaintext)                     │  │  │
│  │  │  - offerSalary: uint32 (plaintext)                 │  │  │
│  │  │  - applicants: address[]                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Evaluations (mapping)                             │  │  │
│  │  │  - key: hash(evaluator, jobId, applicant)          │  │  │
│  │  │  - result: ebool (encrypted boolean)               │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                           │  │
│  │  Functions:                                               │  │
│  │  • register() - Create encrypted user profile             │  │
│  │  • createJob() - Post job with plaintext criteria         │  │
│  │  • applyJob() - Submit application to job                 │  │
│  │  • evaluateApplicant() - FHE-based matching               │  │
│  │  • getUserBasic() - Retrieve public profile data          │  │
│  │  • getUserEncrypted() - Retrieve encrypted profile        │  │
│  │  • getJob() - Retrieve job details                        │  │
│  │  • listJobs() - Get all job IDs                           │  │
│  │  • getApplicants() - Get job applicants                   │  │
│  │  • getEvaluation() - Retrieve encrypted match result      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Zama FHE Relayer (Off-chain Service)                │
│  - Provides encryption/decryption keys                           │
│  - Manages FHE instance initialization                           │
│  - Handles EIP-712 signature verification                        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. User Registration Flow
```
User Input → Zama SDK Encryption → Encrypted Data → Smart Contract → On-chain Storage
(Name, Country, Salary) → euint32 handles → {name, euint32, euint32} → JobLinker.register()
```

#### 2. Job Creation Flow
```
Employer Input → Smart Contract → On-chain Storage
(Country, Salary) → JobLinker.createJob() → {id, creator, country, salary, []}
```

#### 3. Application Flow
```
User → Smart Contract → Applicant Array Update
JobLinker.applyJob(jobId) → jobs[jobId].applicants.push(msg.sender)
```

#### 4. Evaluation Flow (FHE Computation)
```
Employer → Smart Contract FHE Operations → Encrypted Result → Storage
evaluateApplicant() → FHE.eq(country), FHE.le(salary) → FHE.and() → ebool → evaluations[key]
```

#### 5. Result Decryption Flow
```
Encrypted Result → User Signature (EIP-712) → Zama Relayer → Decrypted Boolean
ebool handle → Sign decrypt request → Verify + Decrypt → TRUE/FALSE
```

---

## How It Works

### For Job Seekers

1. **Connect Wallet**
   - Use MetaMask or any WalletConnect-compatible wallet
   - Switch to Sepolia testnet

2. **Register Profile**
   - Enter name (public), country ID, expected salary
   - Frontend encrypts country and salary using Zama SDK
   - Submit transaction to `register()` function
   - Profile is now stored with encrypted sensitive data

3. **Browse Jobs**
   - View all available jobs (location and salary offers are public)
   - Filter jobs by criteria that match your preferences

4. **Apply to Jobs**
   - Click "Apply" on desired jobs
   - Transaction adds your address to job's applicant list
   - Your encrypted profile is preserved

5. **Check Results**
   - Employers can evaluate your application privately
   - If matched, employer contacts you off-chain
   - Your salary expectation remains private even if rejected

### For Employers

1. **Connect Wallet**
   - Connect Web3 wallet to the application

2. **Create Job Posting**
   - Enter job location (country ID) and salary offer (public)
   - Submit transaction to `createJob()` function
   - Job is visible to all users

3. **Review Applications**
   - View list of applicants (addresses only)
   - See applicant count but not their private data

4. **Evaluate Candidates**
   - Click "Evaluate" on any applicant
   - Smart contract performs FHE computation:
     ```
     MATCH = (applicant.country == job.country) AND (applicant.salary <= job.salary)
     ```
   - Result is encrypted boolean (ebool)

5. **Decrypt Results**
   - Sign EIP-712 message to request decryption
   - Zama relayer decrypts result: **YES** (match) or **NO** (no match)
   - Contact matched candidates off-chain for interviews

---

## Installation

### Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: >= 7.0.0
- **Git**: Latest version
- **Metamask** or compatible Web3 wallet
- **Sepolia testnet ETH** (get from [Sepolia Faucet](https://sepoliafaucet.com/))

### Clone Repository

```bash
git clone https://github.com/yourusername/FHEJobLinker.git
cd FHEJobLinker
```

### Install Dependencies

#### Root Project (Smart Contracts)
```bash
npm install
```

#### Frontend Application
```bash
cd app
npm install
cd ..
```

---

## Usage

### 1. Compile Smart Contracts

```bash
npm run compile
```

This generates:
- Contract artifacts in `artifacts/`
- TypeScript types in `types/`
- Contract ABIs for frontend

### 2. Run Tests

```bash
npm test
```

Run tests with coverage:
```bash
npm run coverage
```

### 3. Deploy to Sepolia

Set up environment variables:
```bash
# Set up Hardhat configuration variables
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY  # Optional, for verification
```

Deploy contract:
```bash
npm run deploy:sepolia
```

The deployment script will:
- Deploy `JobLinker` contract to Sepolia
- Generate ABI file at `app/src/abi/JobLinker.ts`
- Output contract address

### 4. Start Frontend Development Server

```bash
cd app
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 5. Configure Wallet

1. Open MetaMask
2. Add Sepolia network (if not already added)
3. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
4. Connect wallet to the application

### 6. Interact with Application

#### Register as Job Seeker
1. Go to **Register** tab
2. Enter:
   - Name (e.g., "Alice")
   - Country ID (e.g., 1 for USA)
   - Expected Salary (e.g., 50000)
3. Click **Register**
4. Confirm transaction in wallet

#### Create Job Posting
1. Go to **Jobs** tab
2. Scroll to "Create Job" section
3. Enter:
   - Country ID (e.g., 1)
   - Salary Offer (e.g., 60000)
4. Click **Create Job**
5. Confirm transaction

#### Apply to Job
1. View job listings in **Jobs** tab
2. Click **Apply** on desired job
3. Confirm transaction

#### Evaluate Applicant (Employer)
1. View applicants for your job
2. Click **Evaluate** on an applicant
3. Click **Decrypt** to see match result
4. Sign EIP-712 message in wallet
5. View result: **YES** or **NO**

---

## Smart Contract Documentation

### Contract: `JobLinker`

**Location**: `/contracts/JobLinker.sol`
**Network**: Sepolia Testnet
**Address**: `0x1b96c687A724E372F005aA4D14c9b6ECB799E1cE` (example deployment)

### Data Structures

#### `UserProfile`
```solidity
struct UserProfile {
    string name;              // Plaintext name
    euint32 country;          // Encrypted country ID
    euint32 expectedSalary;   // Encrypted expected salary
    bool exists;              // Registration status
}
```

#### `Job`
```solidity
struct Job {
    uint256 id;               // Unique job identifier
    address creator;          // Employer address
    uint32 country;           // Plaintext country ID
    uint32 offerSalary;       // Plaintext salary offer
    address[] applicants;     // List of applicant addresses
    bool exists;              // Job existence flag
}
```

### Public Functions

#### `register(string _name, externalEuint32 _country, externalEuint32 _expectedSalary, bytes inputProof)`
Registers a user profile with encrypted fields.

**Parameters**:
- `_name`: User's plaintext name
- `_country`: Encrypted country ID handle (from Zama SDK)
- `_expectedSalary`: Encrypted expected salary handle
- `inputProof`: Cryptographic proof from relayer

**Events**: `UserRegistered(address indexed user)`

**Access Control**: Public, callable by anyone

---

#### `createJob(uint32 _country, uint32 _offerSalary) returns (uint256 jobId)`
Creates a new job posting with plaintext criteria.

**Parameters**:
- `_country`: Country ID where job is located
- `_offerSalary`: Salary offered for the position

**Returns**: New job ID

**Events**: `JobCreated(uint256 indexed jobId, address indexed creator, uint32 country, uint32 offerSalary)`

---

#### `applyJob(uint256 _jobId)`
Applies to a job posting.

**Parameters**:
- `_jobId`: ID of job to apply to

**Requirements**:
- Job must exist
- User must be registered

**Events**: `Applied(uint256 indexed jobId, address indexed applicant)`

---

#### `evaluateApplicant(uint256 jobId, address applicant) returns (ebool)`
Evaluates if applicant meets job criteria using FHE computation.

**Parameters**:
- `jobId`: Job ID to evaluate against
- `applicant`: Address of applicant to evaluate

**Returns**: Encrypted boolean (ebool) representing match result

**Computation**:
```solidity
countryMatch = FHE.eq(applicant.country, job.country)
salaryOk = FHE.le(applicant.expectedSalary, job.offerSalary)
result = FHE.and(countryMatch, salaryOk)
```

**Access Control**: Public, but result is encrypted and only caller can decrypt

---

#### `getUserBasic(address user) returns (string name, bool exists)`
Retrieves user's public profile data.

**Parameters**:
- `user`: Address of user to query

**Returns**:
- `name`: User's plaintext name
- `exists`: Whether user is registered

---

#### `getUserEncrypted(address user) returns (euint32 country, euint32 expectedSalary)`
Retrieves user's encrypted profile fields.

**Parameters**:
- `user`: Address of user to query

**Returns**:
- `country`: Encrypted country ID handle
- `expectedSalary`: Encrypted expected salary handle

**Note**: Only the user can decrypt their own data using Zama relayer + signature

---

#### `getJob(uint256 jobId) returns (address creator, uint32 country, uint32 offerSalary, uint256 applicantsCount)`
Retrieves job details.

**Parameters**:
- `jobId`: Job ID to query

**Returns**:
- `creator`: Employer address
- `country`: Job country ID
- `offerSalary`: Salary offered
- `applicantsCount`: Number of applicants

---

#### `listJobs() returns (uint256[] memory)`
Returns array of all job IDs.

---

#### `getApplicants(uint256 jobId) returns (address[] memory)`
Returns array of applicant addresses for a job.

**Parameters**:
- `jobId`: Job ID to query

---

#### `getEvaluation(address evaluator, uint256 jobId, address applicant) returns (ebool)`
Retrieves stored evaluation result.

**Parameters**:
- `evaluator`: Address that performed evaluation
- `jobId`: Job ID evaluated
- `applicant`: Applicant address evaluated

**Returns**: Encrypted boolean evaluation result

---

## Security Considerations

### Current Security Model

#### ✅ Strengths
1. **Encrypted Storage**: Salary and location data encrypted at rest on-chain
2. **FHE Computation**: Matching performed without decrypting user data
3. **Access Control**: Only users can decrypt their own profiles
4. **Immutable Logic**: Smart contract code is auditable and unchangeable
5. **No Central Authority**: Decentralized architecture eliminates single point of failure

#### ⚠️ Limitations & Future Improvements

1. **Smart Contract Audit**
   - **Status**: Not professionally audited
   - **Recommendation**: Engage third-party audit firm before mainnet deployment
   - **Priority**: HIGH

2. **Front-Running Risk**
   - **Issue**: Job creation transactions visible in mempool
   - **Mitigation**: Consider commit-reveal scheme for job posting
   - **Priority**: MEDIUM

3. **Sybil Attacks**
   - **Issue**: Single user can create multiple wallets/profiles
   - **Mitigation**: Integrate identity verification (e.g., Worldcoin, Gitcoin Passport)
   - **Priority**: MEDIUM

4. **Data Permanence**
   - **Issue**: Blockchain data is permanent (even if encrypted)
   - **Mitigation**: Implement profile deletion/data expiration mechanisms
   - **Priority**: LOW (encrypted data has limited value if keys are destroyed)

5. **Gas Costs**
   - **Issue**: FHE operations are expensive (5-10x normal transactions)
   - **Status**: Acceptable on testnet; optimize for mainnet
   - **Priority**: MEDIUM

6. **Key Management**
   - **Issue**: Users must securely manage wallet private keys
   - **Mitigation**: Support hardware wallets, multisig, social recovery
   - **Priority**: HIGH for production

### Best Practices for Users

- **Never share private keys** or seed phrases
- **Use hardware wallets** (Ledger, Trezor) for high-value accounts
- **Verify contract addresses** before transactions
- **Test on Sepolia** before using mainnet (when available)
- **Keep software updated** (wallet, browser, OS)

---

## Development Roadmap

### Phase 1: Core Platform (Current - Q2 2025) ✅
- [x] FHE-enabled smart contract with basic matching
- [x] React frontend with wallet integration
- [x] User registration with encrypted profiles
- [x] Job creation and application system
- [x] Encrypted evaluation mechanism
- [x] Sepolia testnet deployment

### Phase 2: Enhanced Matching (Q3 2025)
- [ ] **Multi-criteria Matching**
  - Skills/experience level encryption
  - Education background privacy
  - Composite FHE scoring algorithm
- [ ] **Advanced Filters**
  - Salary range queries (FHE-based)
  - Multi-location job support
  - Remote work preference handling
- [ ] **Notification System**
  - On-chain event listening
  - Email/push notifications for matches
  - Application status updates

### Phase 3: Identity & Reputation (Q4 2025)
- [ ] **Decentralized Identity (DID)**
  - ENS integration for human-readable names
  - Verifiable credentials (education, certifications)
  - Proof of work history (without revealing employers)
- [ ] **Reputation System**
  - Employer review NFTs (non-transferable)
  - Anonymous feedback mechanism
  - Stake-based spam prevention
- [ ] **Skill Verification**
  - Zero-knowledge proof-based skill tests
  - On-chain certification tracking

### Phase 4: Economic Model (Q1 2026)
- [ ] **Token Economics**
  - $FHEJOB utility token for premium features
  - Staking for reduced fees
  - Reward system for quality job postings
- [ ] **Fee Structure**
  - Job posting fees (refundable if filled)
  - Success-based commissions
  - Freemium model for job seekers
- [ ] **Decentralized Autonomous Organization (DAO)**
  - Governance token for platform decisions
  - Community-driven feature prioritization
  - Treasury management for sustainability

### Phase 5: Scalability & Mainnet (Q2 2026)
- [ ] **Layer 2 Integration**
  - Optimistic rollup support
  - zkSync/Arbitrum compatibility
  - Gas cost optimization
- [ ] **Cross-Chain Support**
  - Polygon deployment
  - Binance Smart Chain integration
  - Cosmos IBC messaging
- [ ] **Performance Optimization**
  - Batch evaluation processing
  - Off-chain indexing (The Graph)
  - IPFS for profile metadata
- [ ] **Mainnet Launch**
  - Professional security audit
  - Bug bounty program
  - Gradual rollout with usage caps

### Phase 6: Ecosystem Expansion (Q3-Q4 2026)
- [ ] **Integrations**
  - LinkedIn profile import (encrypted)
  - GitHub contribution verification
  - Zapier/IFTTT automation
- [ ] **Mobile Application**
  - Native iOS app
  - Native Android app
  - WalletConnect v2 support
- [ ] **Enterprise Features**
  - Multi-user employer accounts
  - Bulk job posting APIs
  - Candidate pipeline management
  - Analytics dashboards
- [ ] **Marketplace**
  - Resume writing services (paid in tokens)
  - Interview preparation NFT courses
  - Referral bounty system

### Research & Exploration
- [ ] **Advanced Privacy Features**
  - Recursive FHE for complex queries
  - Private set intersection for skill matching
  - Differential privacy for aggregate analytics
- [ ] **AI Integration**
  - Encrypted ML model inference (FHE-based)
  - Resume parsing without data exposure
  - Private job recommendation engines
- [ ] **Regulatory Compliance**
  - GDPR-compliant data deletion
  - Right-to-be-forgotten mechanisms
  - Jurisdictional data residency

---

## Contributing

We welcome contributions from the community! FHEJobLinker is an open-source project that benefits from diverse perspectives.

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/FHEJobLinker.git
   cd FHEJobLinker
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow existing code style (run `npm run lint`)
   - Add tests for new features
   - Update documentation

3. **Test Thoroughly**
   ```bash
   npm test                # Run unit tests
   npm run coverage        # Check test coverage
   npm run compile         # Verify contracts compile
   ```

4. **Submit Pull Request**
   - Write clear commit messages
   - Reference related issues (e.g., "Fixes #42")
   - Describe changes in PR description

### Development Guidelines

#### Smart Contract Development
- Use Solidity 0.8.24+ for latest security features
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Add NatSpec comments to all public functions
- Write comprehensive unit tests (aim for >80% coverage)
- Gas optimization: Profile with `hardhat-gas-reporter`

#### Frontend Development
- Use TypeScript for type safety
- Follow React best practices (hooks, functional components)
- Use Wagmi hooks for blockchain interactions
- Handle loading and error states gracefully
- Mobile-responsive design

#### Documentation
- Update README.md for new features
- Add inline code comments for complex logic
- Create examples for new APIs
- Update architecture diagrams when structure changes

### Reporting Issues

Found a bug or have a feature request?

1. **Check existing issues** to avoid duplicates
2. **Use issue templates** (Bug Report / Feature Request)
3. **Provide details**:
   - Steps to reproduce
   - Expected vs. actual behavior
   - Environment (browser, wallet, network)
   - Screenshots/logs if applicable

### Code of Conduct

- **Be respectful** and inclusive
- **Assume good intentions** in discussions
- **Focus on constructive feedback**
- **No harassment or discrimination**
- **Protect privacy** (never share private keys/sensitive data in issues)

---

## Project Structure

```
FHEJobLinker/
├── contracts/                # Smart contract source files
│   └── JobLinker.sol        # Main FHE-enabled contract
├── deploy/                   # Deployment scripts
│   └── deploy.ts            # Hardhat deploy script
├── test/                     # Contract tests
│   └── JobLinker.ts         # Unit tests for JobLinker
├── tasks/                    # Custom Hardhat tasks
├── app/                      # React frontend
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Header.tsx           # Navigation header
│   │   │   ├── Registration.tsx     # User registration form
│   │   │   ├── JobManager.tsx       # Job creation/listing
│   │   │   ├── Profile.tsx          # User profile viewer
│   │   │   └── JobApp.tsx           # Main app with tab routing
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useZamaInstance.ts   # FHE SDK initialization
│   │   │   └── useEthersSigner.ts   # Ethers.js signer hook
│   │   ├── config/          # Configuration files
│   │   │   └── wagmi.ts             # Wagmi/RainbowKit config
│   │   ├── abi/             # Contract ABIs (auto-generated)
│   │   │   └── JobLinker.ts         # JobLinker ABI + address
│   │   ├── styles/          # CSS files
│   │   ├── App.tsx          # React root component
│   │   ├── main.tsx         # React entry point
│   │   └── vite-env.d.ts    # Vite type definitions
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── artifacts/                # Compiled contract artifacts
├── cache/                    # Hardhat cache
├── types/                    # Generated TypeScript types
├── hardhat.config.ts         # Hardhat configuration
├── package.json              # Root project dependencies
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Environment variable template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

---

## Testing

### Run Unit Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run tests on Sepolia (requires funded account)
npm run test:sepolia

# Generate coverage report
npm run coverage
```

### Test Coverage Goals

- **Smart Contracts**: ≥80% line coverage
- **Frontend Components**: ≥70% coverage (future)

---

## FAQ

### General Questions

**Q: What is Fully Homomorphic Encryption (FHE)?**
A: FHE is a cryptographic method that allows computation on encrypted data without decrypting it. Example: `Encrypted(5) + Encrypted(3) = Encrypted(8)` without ever seeing 5, 3, or 8 in plaintext.

**Q: Why use blockchain for job matching?**
A: Blockchain provides:
- **Transparency**: All matching logic is public and auditable
- **Decentralization**: No single platform controls your data
- **Immutability**: Evaluation results can't be tampered with
- **Composability**: Other dApps can integrate with the protocol

**Q: Is this production-ready?**
A: No. FHEJobLinker is currently a **testnet demo** on Sepolia. It requires security audits, optimizations, and additional features before mainnet launch.

### Technical Questions

**Q: How expensive are FHE operations?**
A: FHE operations cost 5-10x more gas than regular transactions. On Sepolia:
- Registration: ~500k gas
- Job creation: ~100k gas
- Evaluation: ~800k gas (most expensive due to FHE computation)

**Q: Can employers see my encrypted data?**
A: No. Encrypted data (country, salary) can only be decrypted by:
1. The user who owns it (via signature + Zama relayer)
2. Evaluation results (encrypted boolean) by the evaluator

Raw encrypted values are meaningless ciphertext to everyone else.

**Q: What happens if Zama's relayer goes down?**
A: Decryption requires the relayer temporarily. Future versions will support:
- Self-hosted relayer nodes
- Decentralized relayer network
- Alternative decryption mechanisms

**Q: How do I get country IDs?**
A: Currently, use any numeric ID (e.g., 1=USA, 2=Canada, etc.). Future versions will support ISO 3166 codes and human-readable names.

**Q: Can I delete my profile?**
A: Not yet. Blockchain data is permanent. Future versions will implement:
- Key destruction (making encrypted data unrecoverable)
- Profile deactivation flags
- Data expiration timestamps

---

## License

This project is licensed under the **BSD 3-Clause Clear License**.

```
Copyright (c) 2025, FHEJobLinker Contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED
BY THIS LICENSE. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING,
BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

---

## Acknowledgments

- **Zama**: For pioneering FHEVM technology and providing the FHE SDK
- **Ethereum Foundation**: For Sepolia testnet infrastructure
- **Hardhat Team**: For excellent development tooling
- **RainbowKit**: For seamless wallet connection UX
- **Open Source Community**: For inspiration and support

---

## Contact & Links

- **GitHub**: [https://github.com/yourusername/FHEJobLinker](https://github.com/yourusername/FHEJobLinker)
- **Zama Documentation**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **FHEVM Hardhat Plugin**: [https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

---

## Disclaimer

This software is provided "as is" for educational and demonstration purposes. Users are responsible for:
- Securing their private keys
- Verifying contract addresses
- Understanding smart contract risks
- Complying with local regulations

**Do not use with real funds or sensitive data on mainnet without professional security audit.**

---

<p align="center">
  <strong>Built with privacy-first principles using Zama's FHE technology</strong><br>
  Making Web3 recruitment private, fair, and trustless
</p>
