// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BatchRegistry.sol";

/**
 * @title CustodyTransfer
 * @dev Records every handoff between stakeholders with two-step delivery confirmation
 */
contract CustodyTransfer is Ownable {
    
    BatchRegistry public batchRegistry;

    enum Role { None, Farmer, Processor, Distributor, Retailer, Customer }
    enum TransferStatus { None, Pending, Shipped, Delivered }

    struct TransferRequest {
        uint256 batchId;
        address sender;
        address receiver;
        uint256 deliveryDate;
        TransferStatus status;
        uint256 price;
    }

    struct Handoff {
        uint256 batchId;
        address from;
        address to;
        Role toRole;
        uint256 price;
        uint256 timestamp;
        string transactionHash;
    }

    mapping(address => Role) public stakeholderRoles;
    mapping(uint256 => address) public currentCustodian;
    mapping(uint256 => Handoff[]) public batchHandoffs;
    
    // Mapping from batchId to its current transfer request
    mapping(uint256 => TransferRequest) public activeTransfers;

    event CustodyTransferred(
        uint256 indexed batchId,
        address indexed from,
        address indexed to,
        Role toRole,
        uint256 price,
        uint256 timestamp
    );

    event TransferRequested(uint256 indexed batchId, address indexed sender, address indexed receiver, uint256 deliveryDate);
    event ShipmentConfirmed(uint256 indexed batchId, address indexed sender);
    event DeliveryConfirmed(uint256 indexed batchId, address indexed receiver);
    
    event RoleAssigned(address indexed stakeholder, Role role);
    event RoleRevoked(address indexed stakeholder);

    modifier onlyRegisteredStakeholder() {
        require(stakeholderRoles[msg.sender] != Role.None, "Not a registered stakeholder");
        _;
    }

    constructor(address _batchRegistryAddress) Ownable(msg.sender) {
        batchRegistry = BatchRegistry(_batchRegistryAddress);
    }

    function assignRole(address _stakeholder, Role _role) external onlyOwner {
        require(_role != Role.None, "Invalid role");
        stakeholderRoles[_stakeholder] = _role;
        emit RoleAssigned(_stakeholder, _role);
    }

    function revokeRole(address _stakeholder) external onlyOwner {
        stakeholderRoles[_stakeholder] = Role.None;
        emit RoleRevoked(_stakeholder);
    }

    /**
     * @dev Step 1: Seller requests a transfer
     */
    function requestTransfer(
        uint256 _batchId,
        address _receiver,
        uint256 _deliveryDate,
        uint256 _price
    ) external onlyRegisteredStakeholder {
        
        // If batch has no custodian, it means it's newly registered by farmer
        if (currentCustodian[_batchId] == address(0)) {
            BatchRegistry.Batch memory batch = batchRegistry.getBatch(_batchId);
            require(msg.sender == batch.farmer, "Only the farmer can initiate first transfer");
            currentCustodian[_batchId] = msg.sender; // Set initial custodian
        } else {
            require(currentCustodian[_batchId] == msg.sender, "You are not the current custodian");
        }

        require(activeTransfers[_batchId].status == TransferStatus.None || activeTransfers[_batchId].status == TransferStatus.Delivered, "Transfer already in progress");
        
        Role receiverRole = stakeholderRoles[_receiver];
        require(receiverRole != Role.None, "Receiver is not a registered stakeholder");

        activeTransfers[_batchId] = TransferRequest({
            batchId: _batchId,
            sender: msg.sender,
            receiver: _receiver,
            deliveryDate: _deliveryDate,
            status: TransferStatus.Pending,
            price: _price
        });

        emit TransferRequested(_batchId, msg.sender, _receiver, _deliveryDate);
    }

    /**
     * @dev Step 2: Seller confirms shipment dispatched
     */
    function confirmShipment(uint256 _batchId) external {
        TransferRequest storage req = activeTransfers[_batchId];
        require(req.sender == msg.sender, "Only sender can confirm shipment");
        require(req.status == TransferStatus.Pending, "Transfer is not pending");

        req.status = TransferStatus.Shipped;
        emit ShipmentConfirmed(_batchId, msg.sender);
    }

    /**
     * @dev Step 3: Buyer confirms delivery received, which executes the transfer
     */
    function confirmDelivery(uint256 _batchId) external {
        TransferRequest storage req = activeTransfers[_batchId];
        require(req.receiver == msg.sender, "Only receiver can confirm delivery");
        require(req.status == TransferStatus.Shipped, "Shipment not confirmed by sender yet");

        req.status = TransferStatus.Delivered;
        currentCustodian[_batchId] = msg.sender;

        Role receiverRole = stakeholderRoles[msg.sender];

        batchHandoffs[_batchId].push(Handoff({
            batchId: _batchId,
            from: req.sender,
            to: msg.sender,
            toRole: receiverRole,
            price: req.price,
            timestamp: block.timestamp,
            transactionHash: "" // We will set this in the frontend event listener or DB
        }));

        emit DeliveryConfirmed(_batchId, msg.sender);
        emit CustodyTransferred(_batchId, req.sender, msg.sender, receiverRole, req.price, block.timestamp);
    }

    function getHandoffs(uint256 _batchId) external view returns (Handoff[] memory) {
        return batchHandoffs[_batchId];
    }
}
