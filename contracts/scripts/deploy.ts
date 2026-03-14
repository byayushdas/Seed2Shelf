import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy BatchRegistry
  const BatchRegistry = await ethers.getContractFactory("BatchRegistry");
  const batchRegistry = await BatchRegistry.deploy();
  await batchRegistry.waitForDeployment();
  const batchRegistryAddress = await batchRegistry.getAddress();
  console.log("BatchRegistry deployed to:", batchRegistryAddress);

  // Deploy CustodyTransfer
  const CustodyTransfer = await ethers.getContractFactory("CustodyTransfer");
  const custodyTransfer = await CustodyTransfer.deploy(batchRegistryAddress);
  await custodyTransfer.waitForDeployment();
  const custodyTransferAddress = await custodyTransfer.getAddress();
  console.log("CustodyTransfer deployed to:", custodyTransferAddress);

  // Deploy PaymentEscrow
  const PaymentEscrow = await ethers.getContractFactory("PaymentEscrow");
  const paymentEscrow = await PaymentEscrow.deploy(batchRegistryAddress, custodyTransferAddress);
  await paymentEscrow.waitForDeployment();
  const paymentEscrowAddress = await paymentEscrow.getAddress();
  console.log("PaymentEscrow deployed to:", paymentEscrowAddress);

  console.log("Deployment complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
