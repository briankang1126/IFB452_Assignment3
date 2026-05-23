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
     function getRepairHistory(string memory _serialNumber)
        external view returns (Repair[] memory);

    function getRepairCount(string memory _serialNumber)
        external view returns (uint256);
}
contract Verification {

    IDeviceRegistry private deviceRegistry;
    IRepairEvent    private repairEvent;

    constructor(address _deviceRegistryAddress, address _repairEventAddress) {
        require(_deviceRegistryAddress != address(0), "Invalid registry address");
        require(_repairEventAddress    != address(0), "Invalid repair event address");
        deviceRegistry = IDeviceRegistry(_deviceRegistryAddress);
        repairEvent    = IRepairEvent(_repairEventAddress);
    }

    function verifyDevice(string memory _serialNumber)
        public view returns (bool)
    {
        return deviceRegistry.deviceExists(_serialNumber);
    }

    function getTrustScore(string memory _serialNumber)
        public view returns (uint256)
    {
        uint256 total = repairEvent.getRepairCount(_serialNumber);

        if (total == 0) {
            return 100; // never repaired = fully genuine
        }

        IRepairEvent.Repair[] memory history = repairEvent.getRepairHistory(_serialNumber);
        uint256 verifiedCount = 0;

        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].status == IRepairEvent.RepairStatus.VERIFIED) {
                verifiedCount++;
            }
        }

        return (verifiedCount * 100) / total;
    }

    function getFullHistory(string memory _serialNumber)
        public view returns (
            bool isActive,
            uint256 trustScore,
            IRepairEvent.Repair[] memory repairs
        )
    {
        isActive   = deviceRegistry.deviceExists(_serialNumber);
        trustScore = getTrustScore(_serialNumber);
        repairs    = repairEvent.getRepairHistory(_serialNumber);
    }
}