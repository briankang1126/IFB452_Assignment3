// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeviceRegistry{
    address public oem;

    constructor () {
        oem = msg.sender;
    }

    struct Device {
        string serialNumber;
        string imei;
        string model;
        uint256 manufactureDate;
        address currentOwner;
        bool exists;
        bool decommissioned;
    }

    struct Component {
        string partNumber;
        string componentType;
        uint256 manufactureDate;
        bool exists;
    }

    modifier onlyOEM() {
        require(msg.sender == oem, "Only OEM can call this");
        _;
    }

    mapping(bytes32 => Device) public  devices;
    mapping(bytes32 => Component) public components;

    function registerDevice() public onlyOEM {

    }

    function registerComponent() public onlyOEM {

    }

    function transferOwnership() public onlyOEM {

    }

    function decommission() public onlyOEM {

    }

    function deviceExists() public onlyOEM {

    }

    function componentExists() public onlyOEM {

    }

    function getDevice() public onlyOEM {

    }
}