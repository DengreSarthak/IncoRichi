// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { RichVault } from "../RichVault.sol";
import { IncoTest }    from "@inco/lightning/src/test/IncoTest.sol";
import { GWEI }        from "@inco/shared/src/TypeUtils.sol";
import { euint256 }    from "@inco/lightning/src/Lib.sol";

contract TestRichVault is IncoTest {
    RichVault vault;
    address[] participants;

    function setUp() public override {
        super.setUp();

        participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        // Deploy a new RichVault with alice & bob as invitees
        vault = new RichVault("TestVault", owner, participants);
    }

    function testAcceptAndReject() public {
        // Alice accepts, Bob rejects
        vm.prank(alice);
        vault.acceptInvitation();
        vm.prank(bob);
        vault.rejectInvitation();

        // Check statuses
        assertEq(uint(vault.status(alice)), uint(RichVault.ParticipantStatus.Accepted));
        assertEq(uint(vault.status(bob)),   uint(RichVault.ParticipantStatus.Rejected));
    }

    function testSubmitEncryptedWealthAndMax() public {
        // Alice accepts and submits 5 GWEI, Bob rejects
        vm.prank(alice);
        vault.acceptInvitation();
        vm.prank(bob);
        vault.rejectInvitation();

        vm.prank(alice);
        vault.submitEncryptedWealth(fakePrepareEuint256Ciphertext(5 * GWEI));

        // Process off-chain encrypted ops
        processAllOperations();

        // Assert currentMaxWealth updated correctly
        uint256 maxWealth = getUint256Value(vault.currentMaxWealth());
        assertEq(maxWealth, 5 * GWEI);
    }

    function testDeclareRichestOnlyDecryptsHandle() public {

        vm.prank(alice);
        vault.acceptInvitation();
        vm.prank(bob);
        vault.acceptInvitation();

        vm.prank(alice);
        vault.submitEncryptedWealth(fakePrepareEuint256Ciphertext(10 * GWEI));
        processAllOperations();

        vm.prank(bob);
        vault.submitEncryptedWealth(fakePrepareEuint256Ciphertext(5 * GWEI));
        processAllOperations();

        // Declare richest (should be Alice)
        vm.prank(alice);
        (uint256 reqId, euint256 encHandle) = vault.declareRichest();

        // Process decryption
        processAllOperations();

        // Decrypt the handle to get the winner address
        uint256 raw = getUint256Value(encHandle);
        address winner = address(uint160(raw));
        assertEq(winner, alice);
    }
}

