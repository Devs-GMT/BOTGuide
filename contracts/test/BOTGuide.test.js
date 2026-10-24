const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BOTGuide", () => {
  let guide, owner, alice, bob;
  const answer = ethers.id("how do i add bot chain to metamask?\nadd it as a custom network");

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    guide = await (await ethers.getContractFactory("BOTGuide")).deploy();
  });

  describe("ratings", () => {
    it("counts a helpful vote and remembers the choice", async () => {
      await expect(guide.connect(alice).rate(answer, true))
        .to.emit(guide, "Rated")
        .withArgs(answer, alice.address, true);
      const [up, down, mine] = await guide.getVote(answer, alice.address);
      expect([up, down, mine]).to.deep.equal([1n, 0n, 1n]);
      const [, , bobs] = await guide.getVote(answer, bob.address);
      expect(bobs).to.equal(0n);
    });

    it("counts a not helpful vote", async () => {
      await guide.connect(alice).rate(answer, false);
      const [up, down, mine] = await guide.getVote(answer, alice.address);
      expect([up, down, mine]).to.deep.equal([0n, 1n, 2n]);
    });

    it("allows one vote per wallet per answer", async () => {
      await guide.connect(alice).rate(answer, true);
      await expect(guide.connect(alice).rate(answer, false)).to.be.revertedWithCustomError(guide, "AlreadyVoted");
      await expect(guide.connect(alice).rate(answer, true)).to.be.revertedWithCustomError(guide, "AlreadyVoted");
    });

    it("lets the same wallet vote on a different answer", async () => {
      await guide.connect(alice).rate(answer, true);
      await guide.connect(alice).rate(ethers.id("another answer"), false);
      const s = await guide.stats();
      expect([s.helpfulVotes, s.notHelpfulVotes]).to.deep.equal([1n, 1n]);
    });

    it("adds up votes from different wallets", async () => {
      await guide.connect(alice).rate(answer, true);
      await guide.connect(bob).rate(answer, true);
      await guide.connect(owner).rate(answer, false);
      const v = await guide.votes(answer);
      expect([v.up, v.down]).to.deep.equal([2n, 1n]);
    });
  });

  describe("tips", () => {
    const submit = (who, t = "Use testnet first", b = "Deploy on chain 968 before mainnet.", s = "Deploy") =>
      guide.connect(who).submitTip(t, b, s);

    it("stores a tip as pending and emits an event", async () => {
      await expect(submit(alice)).to.emit(guide, "TipSubmitted").withArgs(0n, alice.address, "Use testnet first", "Deploy");
      const tip = await guide.tips(0);
      expect(tip.author).to.equal(alice.address);
      expect(tip.approved).to.equal(false);
      expect(tip.upvotes).to.equal(0n);
      expect(await guide.tipCount()).to.equal(1n);
    });

    it("rejects empty and oversized fields", async () => {
      await expect(submit(alice, "", "body", "Deploy")).to.be.revertedWithCustomError(guide, "EmptyField");
      await expect(submit(alice, "t", "", "Deploy")).to.be.revertedWithCustomError(guide, "EmptyField");
      await expect(submit(alice, "t", "b", "")).to.be.revertedWithCustomError(guide, "EmptyField");
      await expect(submit(alice, "x".repeat(81))).to.be.revertedWithCustomError(guide, "TooLong");
      await expect(submit(alice, "t", "x".repeat(501))).to.be.revertedWithCustomError(guide, "TooLong");
      await expect(submit(alice, "t", "b", "x".repeat(33))).to.be.revertedWithCustomError(guide, "TooLong");
      await submit(alice, "x".repeat(80), "x".repeat(500), "x".repeat(32)); // exactly at the caps
    });

    it("upvotes once per wallet and never your own tip", async () => {
      await submit(alice);
      await guide.connect(bob).upvoteTip(0);
      expect((await guide.tips(0)).upvotes).to.equal(1n);
      expect(await guide.tipUpvoted(0, bob.address)).to.equal(true);
      await expect(guide.connect(bob).upvoteTip(0)).to.be.revertedWithCustomError(guide, "AlreadyVoted");
      await expect(guide.connect(alice).upvoteTip(0)).to.be.revertedWithCustomError(guide, "OwnTip");
      await expect(guide.connect(bob).upvoteTip(9)).to.be.revertedWithCustomError(guide, "UnknownTip");
    });

    it("only the owner approves, once, and it counts for the author", async () => {
      await submit(alice);
      await expect(guide.connect(alice).approveTip(0)).to.be.revertedWithCustomError(guide, "NotOwner");
      await expect(guide.connect(owner).approveTip(0)).to.emit(guide, "TipApproved").withArgs(0n, alice.address);
      expect(await guide.approvedCount(alice.address)).to.equal(1n);
      await expect(guide.connect(owner).approveTip(0)).to.be.revertedWithCustomError(guide, "AlreadyApproved");
      await expect(guide.connect(owner).approveTip(5)).to.be.revertedWithCustomError(guide, "UnknownTip");
    });

    it("pages through tips", async () => {
      for (let i = 0; i < 5; i++) await submit(alice, `Tip ${i}`, `Body ${i}`, "Tools");
      const page = await guide.getTips(1, 2);
      expect(page.map((t) => t.title)).to.deep.equal(["Tip 1", "Tip 2"]);
      expect((await guide.getTips(4, 10)).length).to.equal(1);
      expect((await guide.getTips(5, 10)).length).to.equal(0);
      expect((await guide.getTips(99, 10)).length).to.equal(0);
    });

    it("lists only approved tips, with their ids", async () => {
      for (let i = 0; i < 4; i++) await submit(alice, `Tip ${i}`, `Body ${i}`, "Tools");
      await guide.connect(owner).approveTip(1);
      await guide.connect(owner).approveTip(3);
      const [ids, approved] = await guide.getApprovedTips();
      expect(ids.map(Number)).to.deep.equal([1, 3]);
      expect(approved.map((t) => t.title)).to.deep.equal(["Tip 1", "Tip 3"]);
      expect(approved.every((t) => t.approved)).to.equal(true);
    });
  });

  describe("stats and ownership", () => {
    it("reports totals", async () => {
      await guide.connect(alice).rate(answer, true);
      await guide.connect(bob).rate(answer, false);
      await guide.connect(alice).submitTip("t", "b", "s");
      await guide.connect(owner).approveTip(0);
      const s = await guide.stats();
      expect([s.tipsSubmitted, s.tipsApproved, s.helpfulVotes, s.notHelpfulVotes]).to.deep.equal([1n, 1n, 1n, 1n]);
    });

    it("transfers ownership", async () => {
      await expect(guide.connect(alice).transferOwnership(alice.address)).to.be.revertedWithCustomError(guide, "NotOwner");
      await expect(guide.transferOwnership(ethers.ZeroAddress)).to.be.revertedWithCustomError(guide, "ZeroAddress");
      await guide.transferOwnership(alice.address);
      expect(await guide.owner()).to.equal(alice.address);
      await guide.connect(bob).submitTip("t", "b", "s");
      await guide.connect(alice).approveTip(0); // the new owner can approve
    });
  });
});
