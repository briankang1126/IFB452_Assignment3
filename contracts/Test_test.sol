// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "remix_tests.sol";
import "../contracts/DeviceRegistry.sol";
import "../contracts/RepairEvent.sol";
import "../contracts/Verification.sol";

contract TestBlockchainProvenance {

    DeviceRegistry deviceRegistry;
    RepairEvent    repairEvent;
    Verification   verification;

    function beforeAll() public {
        deviceRegistry = new DeviceRegistry();
        repairEvent    = new RepairEvent(address(deviceRegistry));
        verification   = new Verification(address(deviceRegistry), address(repairEvent));
    }

    function testRegisterDevice() public {
        deviceRegistry.registerDevice("SN001", "123456789012345", "Samsung Galaxy S21");
        Assert.ok(
            deviceRegistry.deviceExists("SN001"),
            "Device should exist after registration"
        );
    }

    function testDuplicateDeviceRejected() public {
        try deviceRegistry.registerDevice("SN001", "123456789012345", "Samsung Galaxy S21") {
            Assert.ok(false, "Should have rejected duplicate");
        } catch {
            Assert.ok(true, "Duplicate correctly rejected");
        }
    }

    function testRegisterComponent() public {
        deviceRegistry.registerComponent("PART001", "battery");
        Assert.ok(
            deviceRegistry.componentExists("PART001"),
            "Component should exist after registration"
        );
    }

    function testUnregisteredComponentReturnsFalse() public {
        Assert.ok(
            !deviceRegistry.componentExists("FAKEPART999"),
            "Unregistered component should return false"
        );
    }

    function testLogRepairWithVerifiedComponent() public {
        repairEvent.logRepair("SN001", "OLDPART000", "PART001");
        Assert.equal(
            repairEvent.getRepairCount("SN001"),
            uint256(1),
            "Repair count should be 1"
        );
    }

    function testLogRepairWithFlaggedComponent() public {
        repairEvent.logRepair("SN001", "PART001", "UNKNOWNPART");
        Assert.equal(
            repairEvent.getRepairCount("SN001"),
            uint256(2),
            "Repair count should be 2"
        );
    }

    function testRepairOnUnregisteredDeviceRejected() public {
        try repairEvent.logRepair("FAKESN999", "OLDPART", "NEWPART") {
            Assert.ok(false, "Should have rejected unregistered device");
        } catch {
            Assert.ok(true, "Unregistered device correctly rejected");
        }
    }

    function testGetRepairHistory() public {
        RepairEvent.Repair[] memory history = repairEvent.getRepairHistory("SN001");
        Assert.equal(
            history.length,
            uint256(2),
            "History should have 2 repairs"
        );
    }

    function testVerifyActiveDevice() public {
        Assert.ok(
            verification.verifyDevice("SN001"),
            "Registered device should be verified as active"
        );
    }

    function testVerifyUnregisteredDeviceReturnsFalse() public {
        Assert.ok(
            !verification.verifyDevice("FAKESN999"),
            "Unregistered device should not be verified"
        );
    }

    function testTrustScoreNeverRepaired() public {
        deviceRegistry.registerDevice("SN002", "999999999999999", "iPhone 13");
        Assert.equal(
            verification.getTrustScore("SN002"),
            uint256(100),
            "Never repaired device should score 100"
        );
    }

    function testTrustScoreCalculation() public {
        Assert.equal(
            verification.getTrustScore("SN001"),
            uint256(50),
            "Trust score should be 50 (1 verified out of 2 repairs)"
        );
    }

    function testGetFullHistory() public {
        (
            bool isActive,
            uint256 trustScore,
            IRepairEvent.Repair[] memory repairs
        ) = verification.getFullHistory("SN001");

        Assert.ok(isActive, "Device should be active");
        Assert.equal(trustScore, uint256(50), "Trust score should be 50");
        Assert.equal(repairs.length, uint256(2), "Should have 2 repairs");
    }

    function testDecommission() public {
        deviceRegistry.registerDevice("SN003", "111111111111111", "Google Pixel 7");
        deviceRegistry.decommission("SN003");
        Assert.ok(
            deviceRegistry.deviceExists("SN003"),
            "Device should still exist in registry"
        );
    }
}