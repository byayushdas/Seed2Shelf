// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BatchRegistry
 * @dev Logs every harvest batch at source
 */
contract BatchRegistry is Ownable {
    
    struct Batch {
        bytes32 id;
        address farmer;
        string cropType;
        uint256 weightKg;
        string gpsCoordinates;
        uint256 farmGatePrice;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => Batch) public batches;
    
    // Farmers who are authorized to log batches
    mapping(address => bool) public authorizedFarmers;

    event BatchRegistered(
        bytes32 indexed batchId,
        address indexed farmer,
        string cropType,
        uint256 weightKg,
        uint256 farmGatePrice,
        uint256 timestamp
    );
    
    event FarmerAuthorized(address indexed farmer);
    event FarmerDeauthorized(address indexed farmer);

    modifier onlyAuthorizedFarmer() {
        require(authorizedFarmers[msg.sender], "Not an authorized farmer");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Authorize a farmer to register batches
     */
    function authorizeFarmer(address _farmer) external onlyOwner {
        authorizedFarmers[_farmer] = true;
        emit FarmerAuthorized(_farmer);
    }
    
    /**
     * @dev Deauthorize a farmer
     */
    function deauthorizeFarmer(address _farmer) external onlyOwner {
        authorizedFarmers[_farmer] = false;
        emit FarmerDeauthorized(_farmer);
    }

    /**
     * @dev Register a new harvest batch
     */
    function registerBatch(
        string memory _cropType,
        uint256 _weightKg,
        string memory _gpsCoordinates,
        uint256 _farmGatePrice
    ) external onlyAuthorizedFarmer returns (bytes32) {
        bytes32 batchId = keccak256(abi.encodePacked(msg.sender, block.timestamp, _cropType));
        require(!batches[batchId].exists, "Hash collision");
        
        batches[batchId] = Batch({
            id: batchId,
            farmer: msg.sender,
            cropType: _cropType,
            weightKg: _weightKg,
            gpsCoordinates: _gpsCoordinates,
            farmGatePrice: _farmGatePrice,
            timestamp: block.timestamp,
            exists: true
        });

        emit BatchRegistered(
            batchId,
            msg.sender,
            _cropType,
            _weightKg,
            _farmGatePrice,
            block.timestamp
        );

        return batchId;
    }

    /**
     * @dev Get batch details
     */
    function getBatch(bytes32 _batchId) external view returns (Batch memory) {
        require(batches[_batchId].exists, "Batch does not exist");
        return batches[_batchId];
    }
}
