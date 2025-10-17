// Auto-generated placeholder. After deploying to Sepolia, the deploy script overwrites this file.
export const JOBLINKER_ADDRESS = '0x0000000000000000000000000000000000000000' as const;
export const JOBLINKER_ABI = [
  { "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "externalEuint32", "name": "_country", "type": "bytes32" },
      { "internalType": "externalEuint32", "name": "_expectedSalary", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ], "name": "register", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [
      { "internalType": "uint32", "name": "_country", "type": "uint32" },
      { "internalType": "uint32", "name": "_offerSalary", "type": "uint32" }
    ], "name": "createJob", "outputs": [ { "internalType": "uint256", "name": "jobId", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "_jobId", "type": "uint256" } ], "name": "applyJob", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ], "name": "getUserBasic", "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "bool", "name": "exists", "type": "bool" }
    ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "address", "name": "user", "type": "address" } ], "name": "getUserEncrypted", "outputs": [
      { "internalType": "euint32", "name": "country", "type": "bytes32" },
      { "internalType": "euint32", "name": "expectedSalary", "type": "bytes32" }
    ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "jobId", "type": "uint256" } ], "name": "getJob", "outputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "uint32", "name": "country", "type": "uint32" },
      { "internalType": "uint32", "name": "offerSalary", "type": "uint32" },
      { "internalType": "uint256", "name": "applicantsCount", "type": "uint256" }
    ], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "listJobs", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "jobId", "type": "uint256" } ], "name": "getApplicants", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" },
  { "inputs": [ { "internalType": "uint256", "name": "jobId", "type": "uint256" }, { "internalType": "address", "name": "applicant", "type": "address" } ], "name": "evaluateApplicant", "outputs": [ { "internalType": "ebool", "name": "", "type": "bytes32" } ], "stateMutability": "nonpayable", "type": "function" }
  ,{ "inputs": [ { "internalType": "address", "name": "evaluator", "type": "address" }, { "internalType": "uint256", "name": "jobId", "type": "uint256" }, { "internalType": "address", "name": "applicant", "type": "address" } ], "name": "getEvaluation", "outputs": [ { "internalType": "ebool", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }
] as const;
