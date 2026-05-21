// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeviceRegistry{
    address public oem;

    constructor () {
        oem = msg.sender;
    }

    modifier onlyOEM() {
        require(msg.sender == oem, "Only OEM can call this");
        _;
    }

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