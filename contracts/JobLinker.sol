// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE-enabled JobLinker
/// @notice Users register encrypted profile; employers post jobs; applications are matched privately
contract JobLinker is ZamaEthereumConfig {
    struct UserProfile {
        string name; // plaintext name
        euint32 country; // encrypted country id
        euint32 expectedSalary; // encrypted expected salary
        bool exists;
    }

    struct Job {
        uint256 id;
        address creator;
        uint32 country; // plaintext country id
        uint32 offerSalary; // plaintext offered salary
        address[] applicants;
        bool exists;
    }

    mapping(address => UserProfile) private profiles;
    uint256 public nextJobId = 1;
    mapping(uint256 => Job) private jobs;
    uint256[] private jobIds;

    // Store last evaluation result per (evaluator, jobId, applicant)
    mapping(bytes32 => ebool) private evaluations;

    event UserRegistered(address indexed user);
    event JobCreated(uint256 indexed jobId, address indexed creator, uint32 country, uint32 offerSalary);
    event Applied(uint256 indexed jobId, address indexed applicant);

    /// @notice Register a user profile with encrypted fields
    /// @param _name User name (plaintext)
    /// @param _country Encrypted country id handle
    /// @param _expectedSalary Encrypted expected salary handle
    /// @param inputProof Input proof from the relayer
    function register(
        string calldata _name,
        externalEuint32 _country,
        externalEuint32 _expectedSalary,
        bytes calldata inputProof
    ) external {
        euint32 country = FHE.fromExternal(_country, inputProof);
        euint32 expectedSalary = FHE.fromExternal(_expectedSalary, inputProof);

        profiles[msg.sender] = UserProfile({
            name: _name,
            country: country,
            expectedSalary: expectedSalary,
            exists: true
        });

        // allow user and contract to access their encrypted fields later
        FHE.allowThis(country);
        FHE.allowThis(expectedSalary);
        FHE.allow(country, msg.sender);
        FHE.allow(expectedSalary, msg.sender);

        emit UserRegistered(msg.sender);
    }

    /// @notice Create a new job posting (plaintext fields)
    function createJob(uint32 _country, uint32 _offerSalary) external returns (uint256 jobId) {
        jobId = nextJobId++;
        Job storage j = jobs[jobId];
        j.id = jobId;
        j.creator = msg.sender;
        j.country = _country;
        j.offerSalary = _offerSalary;
        j.exists = true;
        jobIds.push(jobId);
        emit JobCreated(jobId, msg.sender, _country, _offerSalary);
    }

    /// @notice Apply to a job
    function applyJob(uint256 _jobId) external {
        require(jobs[_jobId].exists, "Job does not exist");
        require(profiles[msg.sender].exists, "Register first");
        jobs[_jobId].applicants.push(msg.sender);
        emit Applied(_jobId, msg.sender);
    }

    /// @notice Get a user's basic info (no msg.sender in view)
    function getUserBasic(address user) external view returns (string memory name, bool exists) {
        UserProfile storage p = profiles[user];
        return (p.name, p.exists);
    }

    /// @notice Get encrypted user fields for decryption by the user (no msg.sender in view)
    function getUserEncrypted(address user) external view returns (euint32 country, euint32 expectedSalary) {
        UserProfile storage p = profiles[user];
        return (p.country, p.expectedSalary);
    }

    /// @notice Get job data
    function getJob(uint256 jobId)
        external
        view
        returns (address creator, uint32 country, uint32 offerSalary, uint256 applicantsCount)
    {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not found");
        return (j.creator, j.country, j.offerSalary, j.applicants.length);
    }

    /// @notice List all job ids
    function listJobs() external view returns (uint256[] memory) {
        return jobIds;
    }

    /// @notice Get all applicants addresses for a job
    function getApplicants(uint256 jobId) external view returns (address[] memory) {
        require(jobs[jobId].exists, "Job not found");
        return jobs[jobId].applicants;
    }

    /// @notice Evaluate if an applicant matches a job's basic criteria under FHE and return encrypted boolean
    /// @dev Grants decrypt permission of the result to the caller; returns encrypted ebool handle
    function evaluateApplicant(uint256 jobId, address applicant) external returns (ebool) {
        Job storage j = jobs[jobId];
        require(j.exists, "Job not found");
        require(profiles[applicant].exists, "Applicant not registered");

        UserProfile storage p = profiles[applicant];

        // Encrypt plaintext criteria into FHE constants to compare
        euint32 jobCountry = FHE.asEuint32(j.country);
        euint32 jobOfferSalary = FHE.asEuint32(j.offerSalary);

        ebool countryMatch = FHE.eq(p.country, jobCountry);
        ebool salaryOk = FHE.le(p.expectedSalary, jobOfferSalary);
        ebool meets = FHE.and(countryMatch, salaryOk);

        // Grant decrypt permission of the result to caller and contract, and persist handle
        FHE.allow(meets, msg.sender);
        FHE.allowThis(meets);

        bytes32 key = keccak256(abi.encode(msg.sender, jobId, applicant));
        evaluations[key] = meets;
        return meets;
    }

    /// @notice Get last evaluation result (encrypted) for an evaluator-job-applicant triple
    /// @dev View method takes explicit evaluator address (no msg.sender)
    function getEvaluation(address evaluator, uint256 jobId, address applicant) external view returns (ebool) {
        bytes32 key = keccak256(abi.encode(evaluator, jobId, applicant));
        return evaluations[key];
    }
}
