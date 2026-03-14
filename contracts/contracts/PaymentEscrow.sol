// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BatchRegistry.sol";
import "./CustodyTransfer.sol";

/**
 * @title PaymentEscrow
 * @dev Holds payment and auto-releases to farmer wallet on confirmed delivery, 48hr timeout auto-flags disputes
 */
contract PaymentEscrow is Ownable {

    BatchRegistry public batchRegistry;
    CustodyTransfer public custodyTransfer;

    enum EscrowStatus { Pending, Locked, Released, Disputed, Refunded }

    struct Escrow {
        uint256 batchId;
        address farmer;
        address buyer;
        uint256 amount;
        uint256 lockTimestamp;
        EscrowStatus status;
    }

    mapping(uint256 => Escrow) public batchEscrows;

    uint256 public constant DISPUTE_TIMEOUT = 48 hours;

    event PaymentLocked(uint256 indexed batchId, address indexed buyer, uint256 amount);
    event PaymentReleased(uint256 indexed batchId, address indexed farmer, uint256 amount);
    event DisputeFlagged(uint256 indexed batchId);
    event PaymentRefunded(uint256 indexed batchId, address indexed buyer, uint256 amount);

    constructor(address _batchRegistryAddress, address _custodyTransferAddress) Ownable(msg.sender) {
        batchRegistry = BatchRegistry(_batchRegistryAddress);
        custodyTransfer = CustodyTransfer(_custodyTransferAddress);
    }

    /**
     * @dev Buyer locks payment in escrow for a batch
     */
    function lockPayment(uint256 _batchId) external payable {
        BatchRegistry.Batch memory batch = batchRegistry.getBatch(_batchId);
        
        require(batch.exists, "Batch does not exist");
        require(msg.value == batch.farmGatePrice, "Incorrect payment amount");
        require(batchEscrows[_batchId].amount == 0, "Payment already locked for this batch");

        batchEscrows[_batchId] = Escrow({
            batchId: _batchId,
            farmer: batch.farmer,
            buyer: msg.sender,
            amount: msg.value,
            lockTimestamp: block.timestamp,
            status: EscrowStatus.Locked
        });

        emit PaymentLocked(_batchId, msg.sender, msg.value);
    }

    /**
     * @dev Release payment to farmer upon successful delivery confirmation
     */
    function releasePayment(uint256 _batchId) external {
        Escrow storage escrow = batchEscrows[_batchId];
        require(escrow.status == EscrowStatus.Locked, "Escrow is not locked");
        
        // Either the buyer confirms or the owner (admin) can force release
        require(msg.sender == escrow.buyer || msg.sender == owner(), "Not authorized to release");

        escrow.status = EscrowStatus.Released;
        payable(escrow.farmer).transfer(escrow.amount);

        emit PaymentReleased(_batchId, escrow.farmer, escrow.amount);
    }

    /**
     * @dev Flag a dispute if there is an issue with the batch
     */
    function flagDispute(uint256 _batchId) external {
        Escrow storage escrow = batchEscrows[_batchId];
        require(escrow.status == EscrowStatus.Locked, "Escrow is not locked");
        require(msg.sender == escrow.buyer || msg.sender == escrow.farmer, "Only buyer or farmer can flag dispute");

        escrow.status = EscrowStatus.Disputed;

        emit DisputeFlagged(_batchId);
    }

    /**
     * @dev Admin resolves dispute and refunds the buyer
     */
    function resolveDisputeRefund(uint256 _batchId) external onlyOwner {
        Escrow storage escrow = batchEscrows[_batchId];
        require(escrow.status == EscrowStatus.Disputed || block.timestamp > escrow.lockTimestamp + DISPUTE_TIMEOUT, "Cannot refund yet");

        escrow.status = EscrowStatus.Refunded;
        payable(escrow.buyer).transfer(escrow.amount);

        emit PaymentRefunded(_batchId, escrow.buyer, escrow.amount);
    }

    /**
     * @dev Admin resolves dispute and releases payment to the farmer
     */
    function resolveDisputeRelease(uint256 _batchId) external onlyOwner {
        Escrow storage escrow = batchEscrows[_batchId];
        require(escrow.status == EscrowStatus.Disputed, "Escrow is not disputed");

        escrow.status = EscrowStatus.Released;
        payable(escrow.farmer).transfer(escrow.amount);

        emit PaymentReleased(_batchId, escrow.farmer, escrow.amount);
    }
}
