import { useMemo, useState } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { Contract } from 'ethers';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { JOBLINKER_ADDRESS, JOBLINKER_ABI } from '../abi/JobLinker';

export function JobManager() {
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance } = useZamaInstance();

  const [newCountry, setNewCountry] = useState('');
  const [newOffer, setNewOffer] = useState('');
  const [creating, setCreating] = useState(false);

  // List job ids
  const { data: jobIds } = useReadContract({
    address: JOBLINKER_ADDRESS,
    abi: JOBLINKER_ABI,
    functionName: 'listJobs',
  });

  // Fetch all jobs
  const jobCalls = useMemo(() =>
    (Array.isArray(jobIds) ? (jobIds as bigint[]).map((id) => ({
      address: JOBLINKER_ADDRESS,
      abi: JOBLINKER_ABI,
      functionName: 'getJob',
      args: [id],
    })) : []), [jobIds]);

  const jobsResult = useReadContracts({ contracts: jobCalls });

  const createJob = async () => {
    if (!address || !signerPromise) return;
    setCreating(true);
    try {
      const signer = await signerPromise;
      if (!signer) throw new Error('No signer');
      const contract = new Contract(JOBLINKER_ADDRESS, JOBLINKER_ABI, signer);
      const tx = await contract.createJob(parseInt(newCountry), parseInt(newOffer));
      await tx.wait();
      setNewCountry('');
      setNewOffer('');
    } catch (e) {
      console.error(e);
      alert('Create job failed');
    } finally {
      setCreating(false);
    }
  };

  const apply = async (jobId: bigint) => {
    try {
      const signer = await signerPromise;
      if (!signer) throw new Error('No signer');
      const contract = new Contract(JOBLINKER_ADDRESS, JOBLINKER_ABI, signer);
      const tx = await contract.applyJob(jobId);
      await tx.wait();
      alert('Applied');
    } catch (e) {
      console.error(e);
      alert('Apply failed');
    }
  };

  const evaluate = async (jobId: bigint, applicant: string) => {
    try {
      const signer = await signerPromise;
      if (!signer || !instance || !address) throw new Error('Missing dependencies');
      const contract = new Contract(JOBLINKER_ADDRESS, JOBLINKER_ABI, signer);
      const eb = await contract.evaluateApplicant(jobId, applicant);

      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10";
      const contractAddresses = [JOBLINKER_ADDRESS];
      const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);
      const signature = await (await signer).signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      const result = await instance.userDecrypt(
        [{ handle: eb, contractAddress: JOBLINKER_ADDRESS }],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      const value = result[eb as string];
      const match = value === '1' || value === 1 || value === true;
      alert(`Applicant ${applicant} match: ${match ? 'YES' : 'NO'}`);
    } catch (e) {
      console.error(e);
      alert('Evaluate failed');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 12 }}>Create Job</h3>
        <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr auto' }}>
          <select value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="select-input">
            <option value="">Country</option>
            <option value="1">USA (1)</option>
            <option value="2">China (2)</option>
            <option value="3">UK (3)</option>
            <option value="4">Germany (4)</option>
            <option value="5">France (5)</option>
            <option value="86">Other (86)</option>
          </select>
          <input type="number" placeholder="Offer Salary" value={newOffer} onChange={(e) => setNewOffer(e.target.value)} className="text-input" />
          <button onClick={createJob} disabled={!address || creating || !newCountry || !newOffer} className="submit-button">{creating ? 'Creating...' : 'Create'}</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: 12 }}>Jobs</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {jobsResult.data && jobsResult.data.map((res, i) => {
            if (!res.result) return null;
            const id = (jobIds as bigint[])[i];
            const [creator, country, offerSalary] = res.result as readonly [string, number, number, bigint];
            return (
              <div key={String(id)} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Job #{String(id)}</div>
                    <div style={{ fontSize: 14, color: '#374151' }}>Country: {country} • Offer: {offerSalary}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Creator: {creator}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="upload-button" onClick={() => apply(id)}>Apply</button>
                  </div>
                </div>

                {/* Applicants section for creator */}
                {address?.toLowerCase() === creator.toLowerCase() && (
                  <Applicants jobId={id} onEvaluate={evaluate} />
                )}
              </div>
            );
          })}
          {!jobsResult.data || jobsResult.data.length === 0 ? (
            <div style={{ color: '#6b7280' }}>No jobs yet</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Applicants({ jobId, onEvaluate }: { jobId: bigint, onEvaluate: (jobId: bigint, applicant: string) => void }) {
  const { data: applicants } = useReadContract({
    address: JOBLINKER_ADDRESS,
    abi: JOBLINKER_ABI,
    functionName: 'getApplicants',
    args: [jobId]
  });

  if (!Array.isArray(applicants) || (applicants as string[]).length === 0) return null;

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Applicants</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {(applicants as string[]).map((a) => (
          <div key={a} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{a}</span>
            <button className="decrypt-button" onClick={() => onEvaluate(jobId, a)}>Evaluate</button>
          </div>
        ))}
      </div>
    </div>
  );
}
