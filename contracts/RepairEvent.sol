// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDeviceRegistry {
    function deviceExists(string memory serialNumber) external view returns (bool);
    function componentExists(string memory partNumber) external view returns (bool);
}
