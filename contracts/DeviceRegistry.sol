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

    function registerDevice(string memory _serialNumber, string memory _imei, string memory _model) public onlyOEM {
        bytes32 id = keccak256(abi.encodePacked(_serialNumber));
        require(!devices [id].exists, "Device already registered");
        devices[id] = Device (_serialNumber, _imei, _model, block.timestamp,msg.sender, true, false);
    }

    function registerComponent(string memory _partNumber, string memory _componentType) public onlyOEM {
        bytes32 id = keccak256(abi.encodePacked(_partNumber));
        require(!components[id]. exists, "Component Already Registered");
        components[id] = Component(_partNumber, _componentType, block.timestamp, true);
    }

    function transferOwnership(string memory _serialNumber, address _newOwner) public {
        bytes32 id = keccak256(abi.encodePacked(_serialNumber));
        require(devices[id].exists, "Device not found");
        require(!devices[id].decommissioned, "Device is decommissioned");
        require(devices[id].currentOwner == msg.sender, "Not current Owner");
        devices[id].currentOwner = _newOwner;
    }

    function decommission(string memory _serialNumber) public {
        bytes32 id = keccak256(abi.encodePacked(_serialNumber));
        require(devices[id].exists, "Device not found");
        require(!devices[id].decommissioned, "Already decommissioned");
        devices[id].decommissioned = true;
    }

    function deviceExists() public onlyOEM {

    }

    function componentExists() public onlyOEM {

    }

    function getDevice() public onlyOEM {

    }
}