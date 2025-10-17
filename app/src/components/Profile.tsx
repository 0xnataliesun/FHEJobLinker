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
      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>
        <div>Please connect your wallet.</div>
      </div>
    );
  }

  if (!exists) {
    return (
      <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>
        <div>No profile found. Please register first.</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: 16 }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>My Profile</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#374151' }}>Name</span>
          <span style={{ fontWeight: 600 }}>{revealed ? name : '***'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#374151' }}>Country ID</span>
          <span style={{ fontWeight: 600 }}>{revealed ? (decCountry ?? '') : '***'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#374151' }}>Expected Salary</span>
          <span style={{ fontWeight: 600 }}>{revealed ? (decSalary ?? '') : '***'}</span>
        </div>
        <div>
          <button className="decrypt-button" onClick={decrypt} disabled={busy || revealed || !countryHandle || !salaryHandle}>
            {busy ? 'Decrypting...' : revealed ? 'Decrypted' : 'Decrypt'}
          </button>
        </div>
      </div>
    </div>
  );
}

