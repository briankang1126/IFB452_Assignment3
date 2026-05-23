// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDeviceRegistry {
    function deviceExists(string memory serialNumber) external view returns (bool);
    function componentExists(string memory partNumber) external view returns (bool);
}

contract RepairEvent {

    enum RepairStatus { VERIFIED, FLAGGED }

    struct Repair {
        string serialNumber;
        string removedPart;
        string newPart;
        address repairer;
        uint256 timestamp;
        RepairStatus status;
    }
    IDeviceRegistry private deviceRegistry;
    mapping(bytes32 => Repair[]) private repairHistory;

    event RepairLogged(
        string indexed serialNumber,
        address indexed repairer,
        string newPart,
        RepairStatus status,
        uint256 timestamp
    );
    constructor(address _deviceRegistryAddress) {
        require(_deviceRegistryAddress != address(0), "Invalid registry address");
        deviceRegistry = IDeviceRegistry(_deviceRegistryAddress);
    }

    function logRepair(
        string memory _serialNumber,
        string memory _removedPart,
        string memory _newPart
    )public {
        require(deviceRegistry.deviceExists(_serialNumber), "Device not registered");

        RepairStatus status;
        if (deviceRegistry.componentExists(_newPart)) {
            status = RepairStatus.VERIFIED;
        } else {
            status = RepairStatus.FLAGGED;
        }