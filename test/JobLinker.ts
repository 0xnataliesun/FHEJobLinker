import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { JobLinker, JobLinker__factory } from "../types";

describe("JobLinker (mock)", function () {
  let deployer: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let job: JobLinker;
  let addr: string;

  before(async () => {
    const s = await ethers.getSigners();
    [deployer, alice, bob] = [s[0], s[1], s[2]];
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn("This suite runs only on mock FHEVM (hardhat)");
      this.skip();
    }
    const f = (await ethers.getContractFactory("JobLinker")) as JobLinker__factory;
    job = (await f.deploy()) as JobLinker;
    addr = await job.getAddress();
  });

  it("register + create job + apply + evaluate", async function () {
    // Alice registers
    const encAlice = await fhevm
      .createEncryptedInput(addr, alice.address)
      .add32(86) // country
      .add32(1000) // expected salary
      .encrypt();
    await expect(job.connect(alice).register("Alice", encAlice.handles[0], encAlice.handles[1], encAlice.inputProof)).to
      .emit(job, "UserRegistered")
      .withArgs(alice.address);

    // Bob registers
    const encBob = await fhevm
      .createEncryptedInput(addr, bob.address)
      .add32(86)
      .add32(2000)
      .encrypt();
    await job.connect(bob).register("Bob", encBob.handles[0], encBob.handles[1], encBob.inputProof);

    // Deployer creates a job for country 86, offer 1500
    const tx = await job.connect(deployer).createJob(86, 1500);
    const rc = await tx.wait();
    const jobId = (await job.listJobs())[0];
    expect(jobId).to.eq(1);

    // Alice applies and should match (1000 <= 1500)
    await job.connect(alice).applyJob(jobId);
    // Bob applies and should not match (2000 > 1500)
    await job.connect(bob).applyJob(jobId);

    // Evaluate Alice
    await job.connect(deployer).evaluateApplicant(jobId, alice.address).then((t) => t.wait());
    const ebAlice = await job.getEvaluation(await deployer.getAddress(), jobId, alice.address);
    const aliceMatch = await fhevm.userDecryptEbool(ebAlice as unknown as string, addr, deployer);
    expect(aliceMatch).to.eq(true);

    // Evaluate Bob
    await job.connect(deployer).evaluateApplicant(jobId, bob.address).then((t) => t.wait());
    const ebBob = await job.getEvaluation(await deployer.getAddress(), jobId, bob.address);
    const bobMatch = await fhevm.userDecryptEbool(ebBob as unknown as string, addr, deployer);
    expect(bobMatch).to.eq(false);
  });
});
