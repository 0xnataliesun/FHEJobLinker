import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import { FhevmType } from "@fhevm/hardhat-plugin";

task("job:address", "Prints the JobLinker address").setAction(async function (_: TaskArguments, hre) {
  const d = await hre.deployments.get("JobLinker");
  console.log(`JobLinker: ${d.address}`);
});

task("job:register", "Register user profile (encrypted country, expected salary)")
  .addParam("name", "User name (plaintext)")
  .addParam("country", "Country id (number)")
  .addParam("salary", "Expected salary (number)")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    const d = await deployments.get("JobLinker");
    await fhevm.initializeCLIApi();
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("JobLinker", d.address);

    const input = await fhevm.createEncryptedInput(d.address, signer.address).add32(parseInt(args.country)).add32(parseInt(args.salary)).encrypt();

    const tx = await contract.connect(signer).register(args.name, input.handles[0], input.handles[1], input.inputProof);
    console.log(`tx: ${tx.hash}`);
    await tx.wait();
  });

task("job:create", "Create a job (plaintext)")
  .addParam("country", "Country id (number)")
  .addParam("offer", "Offered salary (number)")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const d = await deployments.get("JobLinker");
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("JobLinker", d.address);
    const tx = await contract.connect(signer).createJob(parseInt(args.country), parseInt(args.offer));
    const rc = await tx.wait();
    console.log(`Created job. tx: ${tx.hash}`);
    if (rc?.logs) console.log("logs:", rc.logs.length);
  });

task("job:apply", "Apply to a job")
  .addParam("jobid", "Job id")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments } = hre;
    const d = await deployments.get("JobLinker");
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("JobLinker", d.address);
    const tx = await contract.connect(signer).applyJob(parseInt(args.jobid));
    console.log(`tx: ${tx.hash}`);
    await tx.wait();
  });

task("job:evaluate", "Evaluate an applicant for a job (decrypt result)")
  .addParam("jobid", "Job id")
  .addParam("applicant", "Applicant address")
  .setAction(async function (args: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    await fhevm.initializeCLIApi();
    const d = await deployments.get("JobLinker");
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("JobLinker", d.address);

    const eb = await contract.connect(signer).evaluateApplicant(parseInt(args.jobid), args.applicant);
    const clear = await fhevm.userDecryptEbool(eb, d.address, signer);
    console.log(`Match: ${clear}`);
  });
