# ProofVault 🛡️

ProofVault is a production-grade, decentralized proof-of-existence and document timestamping dApp built on Stellar Soroban (Rust smart contracts) and Next.js 15. It allows users to register and verify the existence of digital assets (files, documents, research papers, source code, certificates) at a specific point in time without uploading or exposing raw file content.

## Product Architecture

```
                       ┌────────────────────────┐
                       │  File (Local Browser)  │
                       └───────────┬────────────┘
                                   │
                                   ▼ Compute SHA-256
                       ┌────────────────────────┐
                       │   Cryptographic Hash   │
                       └───────────┬────────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
             ▼ Sign (Freighter Wallet)                   ▼ Query Verification
   ┌───────────────────┐                       ┌───────────────────┐
   │ Soroban Contract  │                       │ Soroban Contract  │
   │ (register_proof)  │                       │     (verify)      │
   └─────────┬─────────┘                       └─────────┬─────────┘
             │                                           │
             ▼ Emits event                               ▼ Returns:
   ┌───────────────────┐                       ┌───────────────────┐
   │  Stellar Ledger   │                       │ Owner, Hash,      │
   │   Confirmation    │                       │ Timestamp         │
   └─────────┬─────────┘                       └───────────────────┘
             │
             ▼ Indexing
   ┌───────────────────┐
   │   Next.js API     │
   ├───────────────────┤
   │    PostgreSQL     │
   └───────────────────┘
```

## Features

- **Local Zero-Knowledge Hashing**: Compute SHA-256 digest entirely in the browser using the Web Crypto API. Raw files are never uploaded to any server.
- **Soroban Smart Contract**: Rust smart contract deployed on the Stellar testnet storing owner address, hash, and ledger timestamps. Prevents duplicate registrations.
- **Freighter Wallet Integration**: Connect and execute on-chain transaction calls directly from the web client.
- **Fast PostgreSQL Indexer**: prisma-cached PostgreSQL database tracking wallet-specific proofs for search and pagination.
- **PDF Certificate Generation**: Downloadable verification certificate indicating the proof details.
- **QR Verification Code**: Easily verifiable QR codes linking to the dApp verify page.

---

## Directory Structure

```
Proof-Vault/
├── client/                     # Next.js 15 Web Application
│   ├── prisma/                 # Database Schema
│   ├── src/
│   │   ├── app/                # Next.js App Router Page Layouts
│   │   ├── components/         # React Components (Uploader, Table, etc.)
│   │   ├── context/            # Wallet Context Providers
│   │   ├── lib/                # Stellar & Prisma Clients
│   │   └── hooks/              # Custom React Hooks
│   ├── package.json
│   └── tsconfig.json
├── contract/                   # Soroban Rust Smart Contract
│   ├── contracts/
│   │   └── contract/
│   │       ├── src/
│   │       │   ├── lib.rs      # Contract methods
│   │       │   └── test.rs     # Integration tests
│   │       └── Cargo.toml
│   └── Cargo.toml
├── Dockerfile                  # Production Web App Docker Image
├── docker-compose.yml          # Local orchestration for Web and PostgreSQL
└── README.md                   # Project documentation
```

---

## Smart Contract API (Rust)

- `register_proof(caller: Address, hash: BytesN<32>)`: Registers a new SHA-256 hash. Enforces signature authorization of the caller, checks for duplicate registrations, and publishes a `reg_proof` event.
- `verify(hash: BytesN<32>) -> Proof`: Queries proof info. Panics if the hash doesn't exist.
- `exists(hash: BytesN<32>) -> bool`: Returns `true` if hash is registered.
- `get_owner(hash: BytesN<32>) -> Address`: Returns the address that registered the hash.
- `get_proofs_by_owner(owner: Address) -> Vec<Proof>`: Retrieves all registered proofs for a specific owner.

---

## Local Development Setup

### 1. Smart Contract Development
Make sure you have Rust and the `soroban-cli` installed.

```bash
# Go to contract folder
cd contract

# Run unit tests
cargo test
```

### 2. Client & Backend Setup
Make sure you have Node.js 20+ installed.

```bash
# Go to client folder
cd client

# Install dependencies
npm install

# Setup local database connection in client/.env
# Copy template env
cp .env.example .env

# Generate prisma client types
npx prisma generate

# Apply database migration
npx prisma db push

# Start the dev server
npm run dev
```

---

## Deployment (Docker & Compose)

Deploy the database and frontend simultaneously with Docker Compose:

```bash
# Setup env configurations in root project directory
# Then start the containers
docker-compose up --build -d
```

Access the frontend app at [http://localhost:3000](http://localhost:3000).

---

## License
MIT
