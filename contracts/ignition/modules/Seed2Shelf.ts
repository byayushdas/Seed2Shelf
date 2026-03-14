import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Seed2ShelfModule", (m) => {
  const batchRegistry = m.contract("BatchRegistry");
  const custodyTransfer = m.contract("CustodyTransfer", [batchRegistry]);
  const paymentEscrow = m.contract("PaymentEscrow", [batchRegistry, custodyTransfer]);

  return { batchRegistry, custodyTransfer, paymentEscrow };
});
