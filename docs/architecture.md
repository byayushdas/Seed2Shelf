# Seed2Shelf Architecture

## System Overview
Seed2Shelf is a decentralised application (dApp) built to track agricultural produce from farm to consumer, ensuring transparency and preventing exploitation.

## Components
1. **Frontend**: Next.js 14 (Pages Router) application providing role-specific dashboards.
2. **Smart Contracts**: Solidity 0.8+ contracts handling state and escrow logic.
3. **Data Layer**: For the demo, mock data is used alongside an abstracted `useChain.ts` hook. In production, this connects via `ethers.js` via an RPC node.

## Network Architecture
- **Layer 1**: Ethereum Mainnet (Target)
- **Testnet**: Sepolia (Used for demonstration and CI/CD testing)

## Security
- Role-based Access Control (RBAC) enforced via smart contract modifiers.
- Escrow contracts hold funds securely, only releasing them based on cryptographic approvals from subsequent supply chain nodes.
