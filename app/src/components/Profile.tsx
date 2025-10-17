import { useState, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { JOBLINKER_ADDRESS, JOBLINKER_ABI } from '../abi/JobLinker';

export function Profile() {
  const { address } = useAccount();
  const { instance } = useZamaInstance();

  const [revealed, setRevealed] = useState(false);
  const [decCountry, setDecCountry] = useState<string | null>(null);
  const [decSalary, setDecSalary] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const enabled = useMemo(() => !!address, [address]);

  const { data: basic } = useReadContract({
    address: JOBLINKER_ADDRESS,
    abi: JOBLINKER_ABI,
    functionName: 'getUserBasic',
    args: [address!],
    query: { enabled },
  });

  const { data: encrypted } = useReadContract({
    address: JOBLINKER_ADDRESS,
    abi: JOBLINKER_ABI,
    functionName: 'getUserEncrypted',
    args: [address!],
    query: { enabled },
  });

  const name = Array.isArray(basic) ? (basic as readonly [string, boolean])[0] : '';
  const exists = Array.isArray(basic) ? (basic as readonly [string, boolean])[1] : false;

  const countryHandle = Array.isArray(encrypted) ? (encrypted as readonly [string, string])[0] : undefined;
  const salaryHandle = Array.isArray(encrypted) ? (encrypted as readonly [string, string])[1] : undefined;

  const decrypt = async () => {
    if (!instance || !address || !countryHandle || !salaryHandle) return;
    setBusy(true);
    try {
      const keypair = instance.generateKeypair();
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '10';
      const contractAddresses = [JOBLINKER_ADDRESS];
      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      // Request signature from wallet via wagmi's public client signer abstraction isn't used here.
      // We leverage window.ethereum directly to sign typed data since we only need the signature here.
      const provider = (window as any).ethereum;
      if (!provider) throw new Error('No wallet');
      const signature: string = await provider.request({
        method: 'eth_signTypedData_v4',
        params: [
          address,
          JSON.stringify({
            domain: eip712.domain,
            types: { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
            primaryType: 'UserDecryptRequestVerification',
            message: eip712.message,
          }),
        ],
      });

      const result = await instance.userDecrypt(
        [
          { handle: countryHandle, contractAddress: JOBLINKER_ADDRESS },
          { handle: salaryHandle, contractAddress: JOBLINKER_ADDRESS },
        ],
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimeStamp,
        durationDays
      );

      const c = result[countryHandle as string];
      const s = result[salaryHandle as string];
      setDecCountry(String(c));
      setDecSalary(String(s));
      setRevealed(true);
    } catch (e) {
      console.error(e);
      alert('Decrypt failed');
    } finally {
      setBusy(false);
    }
  };

  if (!address) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔌</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Wallet Not Connected
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Please connect your wallet to view your profile
        </div>
      </div>
    );
  }

  if (!exists) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Profile Found
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Please register your profile first in the Register tab
        </div>
      </div>
    );
  }

  const countryNames: Record<string, string> = {
    '1': '🇺🇸 United States',
    '2': '🇨🇳 China',
    '3': '🇬🇧 United Kingdom',
    '4': '🇩🇪 Germany',
    '5': '🇫🇷 France',
    '6': '🇯🇵 Japan',
    '7': '🇰🇷 South Korea',
    '8': '🇨🇦 Canada',
    '9': '🇦🇺 Australia',
    '86': '🌍 Other'
  };

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          My Profile
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Your encrypted profile information
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Name Field */}
        <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)', borderRadius: '0.75rem', border: '2px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600 }}>
                Name (Public)
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {name || '---'}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', borderRadius: '0.5rem' }}>
              🔓
            </div>
          </div>
        </div>

        {/* Country Field */}
        <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)', borderRadius: '0.75rem', border: '2px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Country (Encrypted) 🔐
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {revealed && decCountry ? countryNames[decCountry] || `Country ${decCountry}` : '•••••••••'}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: revealed ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '0.5rem' }}>
              {revealed ? '🔓' : '🔒'}
            </div>
          </div>
        </div>

        {/* Salary Field */}
        <div style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)', borderRadius: '0.75rem', border: '2px solid var(--card-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Expected Salary (Encrypted) 🔐
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {revealed && decSalary ? `$${parseInt(decSalary).toLocaleString()}` : '•••••••••'}
              </div>
            </div>
            <div style={{ padding: '0.5rem', background: revealed ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '0.5rem' }}>
              {revealed ? '🔓' : '🔒'}
            </div>
          </div>
        </div>
      </div>

      {/* Decrypt Button */}
      {!revealed && (
        <button
          className="decrypt-button"
          onClick={decrypt}
          disabled={busy || revealed || !countryHandle || !salaryHandle}
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
        >
          {busy ? '⏳ Decrypting...' : '🔓 Decrypt My Profile'}
        </button>
      )}

      {revealed && (
        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderRadius: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#065f46' }}>
            Profile successfully decrypted!
          </div>
        </div>
      )}
    </div>
  );
}

