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
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Create Job Section */}
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            🚀 Post a New Job
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Create a job posting with public requirements
          </p>
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
          <label>
            <span>Country Location</span>
            <select value={newCountry} onChange={(e) => setNewCountry(e.target.value)} className="select-input">
              <option value="">Select country</option>
              <option value="1">🇺🇸 United States</option>
              <option value="2">🇨🇳 China</option>
              <option value="3">🇬🇧 United Kingdom</option>
              <option value="4">🇩🇪 Germany</option>
              <option value="5">🇫🇷 France</option>
              <option value="6">🇯🇵 Japan</option>
              <option value="7">🇰🇷 South Korea</option>
              <option value="8">🇨🇦 Canada</option>
              <option value="9">🇦🇺 Australia</option>
              <option value="86">🌍 Other</option>
            </select>
          </label>
          <label>
            <span>Salary Offer</span>
            <input type="number" placeholder="e.g., 100000" value={newOffer} onChange={(e) => setNewOffer(e.target.value)} className="text-input" min="0" />
          </label>
          <button onClick={createJob} disabled={!address || creating || !newCountry || !newOffer} className="submit-button" style={{ gridColumn: 'span 2', padding: '0.9rem' }}>
            {creating ? '⏳ Creating job...' : '✨ Create Job Posting'}
          </button>
        </div>
      </div>

      {/* Jobs List Section */}
      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            💼 Available Jobs
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse and apply to jobs that match your profile
          </p>
        </div>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {jobsResult.data && jobsResult.data.map((res, i) => {
            if (!res.result) return null;
            const id = (jobIds as bigint[])[i];
            const [creator, country, offerSalary] = res.result as readonly [string, number, number, bigint];
            const countryNames: Record<number, string> = {
              1: '🇺🇸 United States',
              2: '🇨🇳 China',
              3: '🇬🇧 United Kingdom',
              4: '🇩🇪 Germany',
              5: '🇫🇷 France',
              6: '🇯🇵 Japan',
              7: '🇰🇷 South Korea',
              8: '🇨🇦 Canada',
              9: '🇦🇺 Australia',
              86: '🌍 Other'
            };
            return (
              <div key={String(id)} style={{ border: '2px solid var(--card-border)', borderRadius: '1rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(99, 102, 241, 0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--card-border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                      Job #{String(id)}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#4f46e5' }}>
                        📍 {countryNames[country] || `Country ${country}`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderRadius: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#065f46' }}>
                        💰 ${offerSalary.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      Creator: {creator.slice(0, 6)}...{creator.slice(-4)}
                    </div>
                  </div>
                  <button className="upload-button" onClick={() => apply(id)} style={{ whiteSpace: 'nowrap' }}>
                    📝 Apply Now
                  </button>
                </div>

                {/* Applicants section for creator */}
                {address?.toLowerCase() === creator.toLowerCase() && (
                  <Applicants jobId={id} onEvaluate={evaluate} />
                )}
              </div>
            );
          })}
          {!jobsResult.data || jobsResult.data.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No jobs available yet</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Be the first to post a job!</div>
            </div>
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
    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px dashed var(--card-border)' }}>
      <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        👥 Applicants ({(applicants as string[]).length})
      </div>
      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {(applicants as string[]).map((a) => (
          <div key={a} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '0.75rem', border: '1px solid var(--card-border)' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {a.slice(0, 10)}...{a.slice(-8)}
            </span>
            <button className="decrypt-button" onClick={() => onEvaluate(jobId, a)}>
              🔍 Evaluate Match
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
