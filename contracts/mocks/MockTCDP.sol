pragma solidity ^0.5.12;

import "../tCDP.sol";

contract MockTCDP is tCDP {

    function setIsCompound(bool _isCompound) external {
        isCompound = _isCompound;
    }
}