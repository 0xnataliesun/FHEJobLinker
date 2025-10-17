import { useState } from 'react';
import { Contract } from 'ethers';
import { useAccount } from 'wagmi';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { JOBLINKER_ADDRESS, JOBLINKER_ABI } from '../abi/JobLinker';

export function Registration() {
  const { address } = useAccount();
  const signerPromise = useEthersSigner();
  const { instance, isLoading } = useZamaInstance();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [salary, setSalary] = useState('');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance || !address || !signerPromise) return;
    setBusy(true);
    setOk(false);
    try {
      const input = instance.createEncryptedInput(JOBLINKER_ADDRESS, address);
      input.add32(parseInt(country));
      input.add32(parseInt(salary));
      const encrypted = await input.encrypt();
      const signer = await signerPromise;
      if (!signer) throw new Error('No signer');
      const contract = new Contract(JOBLINKER_ADDRESS, JOBLINKER_ABI, signer);
      const tx = await contract.register(name, encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);
      await tx.wait();
      setOk(true);
    } catch (e) {
      console.error(e);
      alert('Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>Register Profile</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="text-input" required />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>Country ID</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="select-input" required>
            <option value="">Select</option>
            <option value="1">USA (1)</option>
            <option value="2">China (2)</option>
            <option value="3">UK (3)</option>
            <option value="4">Germany (4)</option>
            <option value="5">France (5)</option>
            <option value="86">Other (86)</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 14, color: '#374151', marginBottom: 6 }}>Expected Salary</span>
          <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} className="text-input" min="0" required />
        </label>
        <button type="submit" disabled={busy || isLoading || !address} className="submit-button">
          {isLoading ? 'Initializing...' : busy ? 'Submitting...' : 'Submit'}
        </button>
        {ok && <div className="success-box"><span className="success-title">Profile registered!</span></div>}
      </form>
    </div>
  );
}

