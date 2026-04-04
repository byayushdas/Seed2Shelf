# User Flows

## Farmer Flow
1. Connect wallet via `login.tsx` -> `farmer.tsx`
2. Enter crop details, weight, and farm-gate price.
3. Sign transaction -> Invokes `BatchRegistry.registerBatch()`
4. Receive funds via Escrow when retailer confirms delivery.

## Processor Flow
1. Connect wallet via `login.tsx` -> `processor.tsx`
2. View incoming batches. Inspect goods. 
3. Add remarks on quality/sorting. Add processor markup price.
4. Sign transaction -> Invokes `CustodyTransfer.transferCustody()`.

## Distributor Flow
1. Connect wallet via `login.tsx` -> `distributor.tsx`
2. Pick up batch from Processor. 
3. Log transport conditions (e.g. cold chain) and add logistics markup.
4. Sign transaction -> Hands custody to Retailer.

## Retailer Flow
1. Connect wallet via `login.tsx` -> `retailer.tsx`
2. Receive batch. Sign receipt.
3. Trigger `PaymentEscrow.releasePayment()` -> Escrow sends locked funds to Farmer.
4. Set final shelf price. Generate QR Code.

## Consumer Flow
1. Scan QR code on shelf packaging.
2. View `trace/[batchId].tsx` (No login required).
3. See entire journey, origin GPS, quality certificates, and price deltas, verifying fair trade.
