# 🌱 Seed2Shelf

> From farm gate to your plate — every step on-chain.

Seed2Shelf is a blockchain-based agricultural supply chain transparency platform built for the Indian market. It tracks produce across every handoff — from farmer to processor to distributor to retailer — recording price, weight, and custody permanently on the Ethereum blockchain. Consumers scan a QR code on the packaging to see the full verified journey.

---

## The Problem

A farmer sells tomatoes at ₹8/kg. The consumer buys them at ₹60/kg. Nobody in between is accountable for where that ₹52 went. Farmers have no visibility into what happens after they sell, payments are delayed 30–60 days with no recourse, weight and grade fraud happens silently at every node, and consumers have no way to verify origin or price fairness.

Seed2Shelf puts every step on-chain — making exploitation visible, payments automatic, and provenance scannable.

---

## Features

- **Immutable handoff records** — every custody transfer is signed on-chain by both parties
- **Auto price mismatch detection** — smart contracts flag disagreements between agreed and received price
- **Farmer payment escrow** — funds locked at handoff, auto-released on retailer confirmation with a 48hr dispute window
- **Consumer QR trace** — scan to see the full farm-to-shelf price journey, no login required
- **Role-based dashboards** — farmer, processor, distributor, and retailer each see only what's relevant to them
- **Weight shrinkage flagging** — processor weight-in vs weight-out discrepancies flagged automatically

---

## Tech Stack

### Blockchain & Smart Contracts
| Tool | Purpose |
|---|---|
| Solidity ^0.8.20 | Smart contract language |
| Hardhat | Compile, test, and deploy contracts |
| OpenZeppelin | Secure contract components (`Ownable.sol`) |
| ethers.js | Frontend ↔ contract communication |

### Frontend
| Tool | Purpose |
|---|---|
| Next.js 14 (Pages Router) | Core React framework, SSR, routing |
| TypeScript | Static typing |
| Tailwind CSS | Styling — deep green and gold agricultural theme |
| lucide-react | SVG icons for dashboards |
| qrcode.react | QR code generation for consumer tracing |

---

## Architecture

Seed2Shelf is a decentralised application (dApp) with three layers:

**Frontend** — Next.js 14 (Pages Router) provides role-specific dashboards. The `useChain.ts` hook abstracts all blockchain reads and writes, making it easy to switch between mock data (demo mode) and live Sepolia reads.

**Smart Contracts** — Three Solidity contracts handle all on-chain state: batch registration, custody transfer, and payment escrow.

**Data Layer** — In demo mode, `data/batches.json` simulates contract responses. In production, `ethers.js` connects directly to an RPC node on Sepolia or Ethereum mainnet.

**Network targets:**
- Testnet: Sepolia (demo and testing)
- Mainnet: Ethereum L1 (production target)

**Security:**
- Role-based access control (RBAC) enforced via smart contract modifiers
- Escrow funds only release on cryptographic approval from the next supply chain node

---

## Smart Contracts

### `BatchRegistry.sol`
Entry point for the supply chain. Allows authorised farmers to register a new batch tied to crop type, GPS coordinates, weight, and farm-gate price. Every batch gets a unique on-chain batch ID.

### `CustodyTransfer.sol`
Manages the chain of custody across roles (Processor → Distributor → Retailer). Enforces correct state transitions and logs the price markup set at every stage. Flags price mismatches automatically.

### `PaymentEscrow.sol`
Financial security layer. A buyer locks the farm-gate price in escrow before the farmer ships. When the retailer confirms receipt, escrow releases funds directly to the farmer. Includes a 48-hour timeout to raise disputes.

---

## User Flows

**Farmer** — connects wallet → logs crop, weight, farm-gate price → signs transaction invoking `BatchRegistry.registerBatch()` → receives escrow payment when retailer confirms delivery.

**Processor** — views incoming batches → inspects goods → adds quality remarks and markup price → signs transaction invoking `CustodyTransfer.transferCustody()`.

**Distributor** — picks up batch from processor → logs transport conditions and logistics markup → signs handoff to retailer.

**Retailer** — receives batch → signs receipt → triggers `PaymentEscrow.releasePayment()` → sets shelf price → generates QR code.

**Consumer** — scans QR code on packaging → views `/trace/[batchId]` (no login required) → sees full journey, origin GPS, price at every node, and quality certificates.

---

## Project Structure

```
seed2shelf/
├── contracts/
│   ├── BatchRegistry.sol
│   ├── CustodyTransfer.sol
│   ├── PaymentEscrow.sol
│   ├── hardhat.config.ts
│   ├── scripts/
│   │   └── deploy.ts
│   └── test/
├── frontend/
│   ├── pages/
│   │   ├── index.tsx           # Landing page
│   │   ├── login.tsx           # Role-based login
│   │   ├── farmer.tsx          # Farmer dashboard
│   │   ├── processor.tsx       # Processor dashboard
│   │   ├── distributor.tsx     # Distributor dashboard
│   │   ├── retailer.tsx        # Retailer dashboard
│   │   └── trace/
│   │       └── [batchId].tsx   # Consumer QR trace page
│   ├── components/
│   ├── hooks/
│   │   └── useChain.ts
│   └── data/
│       └── batches.json        # Mock chain data for demo
└── docs/
    ├── architecture.md
    ├── smart-contracts.md
    ├── user-flows.md
    └── stack.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask browser extension (for live Sepolia mode)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/seed2shelf.git
cd seed2shelf
```

### 2. Install contract dependencies

```bash
cd contracts
npm install
```

### 3. Compile contracts

```bash
npx hardhat compile
```

### 4. Run contract tests

```bash
npx hardhat test
```

### 5. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 6. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the following in `.env.local`:

```env
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
NEXT_PUBLIC_BATCH_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_CUSTODY_TRANSFER_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0x...
```

> For demo mode without a live chain, leave these blank — the app falls back to `data/batches.json`.

### 7. Run the frontend

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Demo Mode vs Live Mode

| Mode | How it works |
|---|---|
| **Demo** | Frontend reads from `data/batches.json`. No wallet or RPC needed. Zero setup friction. |
| **Live (Sepolia)** | Frontend reads directly from deployed contracts via ethers.js. Requires MetaMask + Sepolia ETH from a faucet. |

To get free Sepolia ETH: [sepoliafaucet.com](https://sepoliafaucet.com)

---

## Deploying Contracts to Sepolia

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the deployed contract addresses into your `.env.local`.

---

## License

MIT

---

> Built to make agricultural supply chains in India transparent, fair, and fraud-resistant.
