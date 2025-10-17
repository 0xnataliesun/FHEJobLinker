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
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Register Your Profile
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🔒</span>
          Your data is encrypted by Zama FHE technology
        </p>
      </div>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <label>
          <span>Your Name (Public)</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="text-input" placeholder="Enter your full name" required />
        </label>
        <label>
          <span>Country (Encrypted 🔐)</span>
          <select value={country} onChange={(e) => setCountry(e.target.value)} className="select-input" required>
            <option value="">Select your country</option>
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
          <span>Expected Salary (Encrypted 🔐)</span>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="text-input"
            placeholder="e.g., 80000"
            min="0"
            required
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            This will be encrypted and only used for matching
          </span>
        </label>
        <button type="submit" disabled={busy || isLoading || !address} className="submit-button" style={{ marginTop: '0.5rem', width: '100%', padding: '1rem' }}>
          {isLoading ? '🔄 Initializing encryption...' : busy ? '📤 Submitting profile...' : '✨ Register Profile'}
        </button>
        {ok && (
          <div className="success-box">
            <span className="success-title">Profile registered successfully!</span>
          </div>
        )}
      </form>
    </div>
  );
}

