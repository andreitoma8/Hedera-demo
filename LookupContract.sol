// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LookupContract {
    mapping(string => uint256) public myDirectory;

    constructor(string memory _name, uint256 _mobileNumber) {
        myDirectory[_name] = _mobileNumber;
    }

    function setMobileNumber(string memory _name, uint256 _mobileNumber)
        public
    {
        myDirectory[_name] = _mobileNumber;
    }

    function getMobileNumber(string memory _name)
        public
        view
        returns (uint256)
    {
        return myDirectory[_name];
    }
}
