// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BatchRegistry.sol";

/**
 * @title CustodyTransfer
 * @dev Records every handoff between stakeholders with price delta detection
 */
contract CustodyTransfer is Ownable {
    
    BatchRegistry public batchRegistry;

    enum Role { None, Processor, Distributor, Retailer }

    struct Handoff {
        bytes32 batchId;
        address from;
        address to;
        Role toRole;
        uint256 price;
        uint256 timestamp;
        string remarks;
    }

    // Role management
    mapping(address => Role) public stakeholderRoles;

    // Track custody
    mapping(bytes32 => address) public currentCustodian;
    mapping(bytes32 => Handoff[]) public batchHandoffs;

    event CustodyTransferred(
        bytes32 indexed batchId,
        address indexed from,
        address indexed to,
        Role toRole,
        uint256 price,
        uint256 timestamp
    );

    event RoleAssigned(address indexed stakeholder, Role role);
    event RoleRevoked(address indexed stakeholder);

    modifier onlyRegisteredStakeholder() {
        require(stakeholderRoles[msg.sender] != Role.None, "Not a registered stakeholder");
        _;
    }

    constructor(address _batchRegistryAddress) Ownable(msg.sender) {
        batchRegistry = BatchRegistry(_batchRegistryAddress);
    }

    /**
     * @dev Assign a role to a stakeholder
     */
    function assignRole(address _stakeholder, Role _role) external onlyOwner {
        require(_role != Role.None, "Invalid role");
        stakeholderRoles[_stakeholder] = _role;
        emit RoleAssigned(_stakeholder, _role);
    }

    /**
     * @dev Revoke a role
     */
    function revokeRole(address _stakeholder) external onlyOwner {
        stakeholderRoles[_stakeholder] = Role.None;
        emit RoleRevoked(_stakeholder);
    }

    /**
     * @dev Initial transfer from farmer to processor
     */
    function initialTransfer(
        bytes32 _batchId,
        address _processor,
        uint256 _price,
        string memory _remarks
    ) external {
        BatchRegistry.Batch memory batch = batchRegistry.getBatch(_batchId);
        require(msg.sender == batch.farmer, "Only the farmer can initiate transport");
        require(currentCustodian[_batchId] == address(0), "Batch is already in transit");
        require(stakeholderRoles[_processor] == Role.Processor, "Receiver must be a processor");

        _transferCustody(_batchId, msg.sender, _processor, Role.Processor, _price, _remarks);
    }

    /**
     * @dev Transfer custody to the next stakeholder
     */
    function transferCustody(
        bytes32 _batchId,
        address _to,
        uint256 _price,
        string memory _remarks
    ) external onlyRegisteredStakeholder {
        require(currentCustodian[_batchId] == msg.sender, "You are not the current custodian");
        
        Role senderRole = stakeholderRoles[msg.sender];
        Role receiverRole = stakeholderRoles[_to];

        require(receiverRole != Role.None, "Receiver is not a registered stakeholder");
        
        // Logical flow enforcement: Processor -> Distributor -> Retailer
        if (senderRole == Role.Processor) {
            require(receiverRole == Role.Distributor, "Processor can only transfer to Distributor");
        } else if (senderRole == Role.Distributor) {
            require(receiverRole == Role.Retailer, "Distributor can only transfer to Retailer");
        } else {
            revert("Invalid transfer path");
        }

        _transferCustody(_batchId, msg.sender, _to, receiverRole, _price, _remarks);
    }

    /**
     * @dev Internal function to record the transfer
     */
    function _transferCustody(
        bytes32 _batchId,
        address _from,
        address _to,
        Role _toRole,
        uint256 _price,
        string memory _remarks
    ) internal {
        currentCustodian[_batchId] = _to;

        batchHandoffs[_batchId].push(Handoff({
            batchId: _batchId,
            from: _from,
            to: _to,
            toRole: _toRole,
            price: _price,
            timestamp: block.timestamp,
            remarks: _remarks
        }));

        emit CustodyTransferred(_batchId, _from, _to, _toRole, _price, block.timestamp);
    }

    /**
     * @dev Get all handoffs for a batch
     */
    function getHandoffs(bytes32 _batchId) external view returns (Handoff[] memory) {
        return batchHandoffs[_batchId];
    }
}
