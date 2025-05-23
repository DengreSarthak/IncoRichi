// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { euint256, ebool, e } from "@inco/lightning/src/Lib.sol";

contract RichVault {
    using e for euint256;
    using e for ebool;
    using e for uint256;
    using e for bytes;
    using e for address;
    using e for bool;

    string public vaultName;
    address public vaultCreator;

    // ← new public state
    address public winnerAddress;

    enum ParticipantStatus { NotInvited, Invited, Accepted, Rejected }

    address[] public participants;
    address[] public acceptedParticipants;
    address[] public rejectedParticipants;

    mapping(address => ParticipantStatus) public status;
    mapping(address => euint256)       public encryptedWealth;
    mapping(address => bool)           public hasSubmittedWealth;

    euint256 public currentMaxWealth;
    euint256 public currentMaxHandle;

    event Invited(address indexed participant);
    event Accepted(address indexed participant);
    event Rejected(address indexed participant);
    event WealthSubmitted(address indexed participant, euint256 wealth);
    event RichestDeclared(address indexed richest);

    constructor(
      string memory _vaultName,
      address _creator,
      address[] memory _participants
    ) {
        vaultName    = _vaultName;
        vaultCreator = _creator;

        currentMaxWealth = uint256(0).asEuint256();
        currentMaxHandle = uint256(0).asEuint256();

        currentMaxWealth.allowThis();
        currentMaxHandle.allowThis();

        for (uint i = 0; i < _participants.length; i++) {
            address p = _participants[i];
            status[p] = ParticipantStatus.Invited;
            participants.push(p);
            emit Invited(p);
        }
    }

    modifier onlyInvited() {
        require(status[msg.sender] == ParticipantStatus.Invited, "Not invited");
        _;
    }

    modifier onlyAccepted() {
        require(status[msg.sender] == ParticipantStatus.Accepted, "Not accepted");
        _;
    }

    function acceptInvitation() external onlyInvited {
        status[msg.sender] = ParticipantStatus.Accepted;
        acceptedParticipants.push(msg.sender);
        emit Accepted(msg.sender);
    }

    function rejectInvitation() external onlyInvited {
        status[msg.sender] = ParticipantStatus.Rejected;
        rejectedParticipants.push(msg.sender);
        emit Rejected(msg.sender);
    }

    function submitEncryptedWealth(bytes memory wealthInput) external onlyAccepted {
        require(!hasSubmittedWealth[msg.sender], "Already submitted");

        euint256 w = wealthInput.newEuint256(msg.sender);
        w.allowThis();
        currentMaxWealth.allowThis();
        currentMaxHandle.allowThis();

        ebool   isGreater = w.gt(currentMaxWealth);
        euint256 candidateMaxWealth = isGreater.select(w,          currentMaxWealth);
        euint256 candidateMaxHandle = isGreater.select(
                                        uint256(uint160(msg.sender)).asEuint256(),
                                        currentMaxHandle
                                    );

        candidateMaxWealth.allowThis();
        candidateMaxHandle.allowThis();

        encryptedWealth[msg.sender] = w;
        hasSubmittedWealth[msg.sender] = true;
        currentMaxWealth = candidateMaxWealth;
        currentMaxHandle = candidateMaxHandle;

        for (uint i = 0; i < participants.length; i++) {
            address p = participants[i];
            if (status[p] == ParticipantStatus.Accepted) {
                w.allow(p);
                candidateMaxWealth.allow(p);
                candidateMaxHandle.allow(p);
            }
        }

        emit WealthSubmitted(msg.sender, w);
    }

    function declareRichest()
      external
      onlyAccepted
      returns (uint256 requestId, euint256 richestHandle)
    {
        require(
          acceptedParticipants.length + rejectedParticipants.length == participants.length,
          "Some invitations still pending"
        );

        euint256 bestH = currentMaxHandle;
        bestH.allowThis();
        bestH.allow(msg.sender);

        requestId     = e.requestDecryption(bestH, this.declareCallback.selector, "");
        richestHandle = bestH;
    }

    function declareCallback(
      uint256 /*requestId*/,
      uint256 richestRaw,
      bytes memory /*data*/
    ) external {
        address winner = address(uint160(richestRaw));

        // ← set the public variable
        winnerAddress = winner;

        emit RichestDeclared(winner);
    }

    function getParticipants() external view returns (address[] memory) { return participants; }
    function getAccepted()     external view returns (address[] memory) { return acceptedParticipants; }
    function getRejected()     external view returns (address[] memory) { return rejectedParticipants; }
}
