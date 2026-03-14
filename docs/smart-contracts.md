# Smart Contracts Documentation

The system relies on three core smart contracts:

## 1. BatchRegistry.sol
- **Purpose**: The entry point for the supply chain.
- **Functionality**: Allows authorized farmers to mint a new Batch ID tied to a crop, GPS coordinate, weight, and an initial farm-gate price.

## 2. CustodyTransfer.sol
- **Purpose**: Manages the chain of custody.
- **Functionality**: Records handoffs between defined roles (Processor -> Distributor -> Retailer). Enforces correct state transitions and logs the price markup set at every stage.

## 3. PaymentEscrow.sol
- **Purpose**: Financial security.
- **Functionality**: Before a farmer ships, a buyer locks the farm-gate price in escrow. When the Retailer receives the final shipment, it unlocks the escrow, releasing funds to the farmer. Includes a 48-hour timeout to raise disputes.
