import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { network, ethers } from "hardhat";

describe("MyGovernor Contract", function () {
  async function deployFixture() {
    const [owner, authAccount, nonAuthAccount] = await ethers.getSigners();

    const myERC20 = await ethers.deployContract("MyERC20");
    await myERC20.waitForDeployment();

    const myTimelockController = await ethers.deployContract(
      "MyTimelockController",
      [
        60 * 2 /* 2 min */,
        [authAccount.getAddress()],
        [authAccount.getAddress()],
        owner.getAddress(),
      ]
    );
    await myTimelockController.waitForDeployment();

    const myGovernor = await ethers.deployContract("MyGovernor", [
      myERC20.target,
      myTimelockController.target,
    ]);
    await myGovernor.waitForDeployment();

    const proposerRole = await myTimelockController.PROPOSER_ROLE();
    const executorRole = await myTimelockController.EXECUTOR_ROLE();
    const adminRole = await myTimelockController.TIMELOCK_ADMIN_ROLE();

    await myTimelockController.grantRole(proposerRole, myGovernor.target);
    await myTimelockController.grantRole(executorRole, "0x00");
    await myTimelockController.grantRole(adminRole, owner.getAddress());

    await myERC20.mint(authAccount, 1000000);

    await myERC20.grantMinterRole(myTimelockController.target);

    return {
      owner,
      authAccount,
      nonAuthAccount,
      myERC20,
      myTimelockController,
      myGovernor,
    };
  }

  describe("MyGovernorの初期化テスト", function () {
    it("ガバナンストークンの初期化が正しくできているかのテスト", async function () {
      const { myERC20, myGovernor } = await loadFixture(deployFixture);
      expect(await myGovernor.token()).to.equal(myERC20.target);
    });

    it("TimelockControllerの初期設定が正しくできているかのテスト", async function () {
      const { myTimelockController, myGovernor } = await loadFixture(
        deployFixture
      );
      expect(await myGovernor.timelock()).to.equal(myTimelockController.target);
    });

    it("投票遅延の初期設定が正しくできているかのテスト", async function () {
      const { myGovernor } = await loadFixture(deployFixture);
      expect(await myGovernor.votingDelay()).to.equal(0);
    });

    it("投票期間の初期設定が正しくできているかのテスト", async function () {
      const { myGovernor } = await loadFixture(deployFixture);
      expect(await myGovernor.votingDelay()).to.equal(2);
    });

    it("投票閾値の初期設定が正しくできているかのテスト", async function () {
      const { myGovernor } = await loadFixture(deployFixture);
      expect(await myGovernor.proposalThreshold()).to.equal(0);
    });
  });

  describe("提案作成から実行機能のテスト", function () {
    it("権限がある人が正しく提案を作成し、実行まで完了できるかのテスト", async function () {
      const { authAccount, myGovernor, myERC20 } = await loadFixture(
        deployFixture
      );
      const myERC20WithAuthorized = myERC20.connect(authAccount);
      expect(
        await myERC20WithAuthorized.balanceOf(await authAccount.getAddress())
      ).to.equal(100000);

      await myERC20WithAuthorized.delegate(await authAccount.getAddress());

      expect(
        await myERC20WithAuthorized.delegates(await authAccount.getAddress())
      ).to.equal(await authAccount.getAddress());

      const proposal = {
        targets: [myERC20.target],
        values: [0],
        calldatas: [
          myERC20.interface.encodeFunctionData("mint", [
            await authAccount.getAddress(),
            1000000,
          ]),
        ],
        description: "Mint 10 tokens to authAccount",
      };

      const myGovernorWithAuthorized = myGovernor.connect(authAccount);

      await myGovernorWithAuthorized.propose(
        proposal.targets,
        proposal.values,
        proposal.calldatas,
        proposal.description
      );

      const proposalId = await myGovernorWithAuthorized.hashProposal(
        proposal.targets,
        proposal.values,
        proposal.calldatas,
        ethers.keccak256(ethers.toUtf8Bytes(proposal.description))
      );

      expect(await myGovernorWithAuthorized.state(proposalId)).to.equal(
        0,
        "proposal is not Pending"
      );

      await network.provider.send("hardhat_mine", ["0x1"]);
      expect(await myGovernorWithAuthorized.state(proposalId)).to.equal(
        1,
        "proposal is not Active"
      );

      await myGovernorWithAuthorized.castVote(proposalId, 1);

      const isVoted = await myGovernorWithAuthorized.hasVoted(
        proposalId,
        await authAccount.getAddress()
      );
      expect(isVoted).to.equal(true);

      const proposalVotesResponse =
        await myGovernorWithAuthorized.proposalVotes(proposalId);

      expect(proposalVotesResponse.againstVotes).to.equal(
        0,
        "proposal againstVotes is not 0"
      );
      expect(proposalVotesResponse.forVotes).to.equal(
        1000000,
        "proposal forVotes is not 1000000"
      );
      expect(proposalVotesResponse.abstainVotes).to.equal(
        0,
        "proposal abstainVotes is not 0"
      );

      await network.provider.send("hardhat_mine", ["0x1"]);

      expect(await myGovernor.state(proposalId)).to.equal(4);

      await myGovernorWithAuthorized.queue(
        proposal.targets,
        proposal.values,
        proposal.calldatas,
        ethers.keccak256(ethers.toUtf8Bytes(proposal.description))
      );

      expect(await myGovernorWithAuthorized.state(proposalId)).to.equal(5);

      await network.provider.send("evm_increaseTime", [120]);

      await myGovernorWithAuthorized.execute(
        proposal.targets,
        proposal.values,
        proposal.calldatas,
        ethers.keccak256(ethers.toUtf8Bytes(proposal.description))
      );

      expect(await myGovernorWithAuthorized.state(proposalId)).to.equal(7);

      expect(
        await myERC20WithAuthorized.balanceOf(await authAccount.getAddress())
      ).to.equal(2000000); // 1000000 initial + 1000000 minted
    });
  });
});
