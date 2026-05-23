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