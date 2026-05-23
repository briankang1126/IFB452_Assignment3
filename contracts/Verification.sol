// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDeviceRegistry {
    function deviceExists(string memory _serialNumber) external view returns (bool);
}

interface IRepairEvent {
    enum RepairStatus { VERIFIED, FLAGGED }
      struct Repair {
        string serialNumber;
        string removedPart;
        string newPart;
        address repairer;
        uint256 timestamp;
        RepairStatus status;
    }