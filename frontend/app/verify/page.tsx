'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'; // Recommended: npm install lucide-react
import api from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Verifying your account...');

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid or missing verification link.');
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await api.post('/auth/verify-account', { email, token });
        setStatus('success');
        setMessage(res.data.message || 'Your account has been verified successfully.');
        toast.success('Account verified successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.response?.data?.message || 'The verification link is invalid or has expired.');
        toast.error('Verification failed.');
      }
    };

    verifyAccount();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white p-10 rounded-3xl shadow-lg border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
        
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verifying</h2>
              <p className="text-slate-500 mt-2 text-sm">Please wait while we confirm your credentials.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verified</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md shadow-slate-900/10"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <XCircle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verification Failed</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={() => router.push('/auth/register')}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all"
            >
              Back to Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-pulse text-slate-400 font-medium">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}