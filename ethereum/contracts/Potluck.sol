// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract Potluck {
    address public manager;
    uint public ticketCount;
    address[] public tickets;
    uint public ticketPrice;

    constructor(uint _ticketCount, uint _ticketPrice) {
        require(_ticketCount <= 100, "Number of entries can't be bigger than 100.");

        manager = msg.sender;
        tickets = new address[](_ticketCount);
        ticketPrice = _ticketPrice;
    }

    function getTickets()
        public view
        returns(address[] memory)
    {
        return tickets;
    }

    function join(uint index)
        public payable
    {
        require(
            msg.value >= ticketPrice,
            "Insufficient funds to buy ticket"
        );

        require(
            tickets[index] == address(0),
            "Ticket number is already taken."
        );

        tickets[index] = msg.sender;
    }
}
