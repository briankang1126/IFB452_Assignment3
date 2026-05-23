// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDeviceRegistry {
    function deviceExists(string memory _serialNumber) external view returns (bool);
}

interface IRepairEvent {
    enum RepairStatus { VERIFIED, FLAGGED }
