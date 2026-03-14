import fs from 'fs';
import path from 'path';

const ADDRESSES = {
  BatchRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  CustodyTransfer: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  PaymentEscrow: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
};

const ABI_PATHS = {
  BatchRegistry: "./artifacts/contracts/BatchRegistry.sol/BatchRegistry.json",
  CustodyTransfer: "./artifacts/contracts/CustodyTransfer.sol/CustodyTransfer.json",
  PaymentEscrow: "./artifacts/contracts/PaymentEscrow.sol/PaymentEscrow.json"
};

const output = `// Auto-generated via Hardhat
export const CONTRACT_ADDRESSES = ${JSON.stringify(ADDRESSES, null, 2)};

export const BatchRegistryABI = ${JSON.stringify(JSON.parse(fs.readFileSync(ABI_PATHS.BatchRegistry, 'utf8')).abi, null, 2)} as const;
export const CustodyTransferABI = ${JSON.stringify(JSON.parse(fs.readFileSync(ABI_PATHS.CustodyTransfer, 'utf8')).abi, null, 2)} as const;
export const PaymentEscrowABI = ${JSON.stringify(JSON.parse(fs.readFileSync(ABI_PATHS.PaymentEscrow, 'utf8')).abi, null, 2)} as const;
`;

fs.mkdirSync("../frontend/config", { recursive: true });
fs.writeFileSync("../frontend/config/contracts.ts", output);
console.log("Config exported successfully.");
