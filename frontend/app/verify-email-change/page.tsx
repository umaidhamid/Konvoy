'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';

type Status = 'loading' | 'success' | 'error';

function VerifyEmailChangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Confirming your new email...');

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      setStatus('error');
      setMessage('Invalid or missing confirmation link.');
      return;
    }

    const confirm = async () => {
      try {
        const res = await api.post('/auth/confirm-email-change', { email, token });
        setStatus('success');
        setMessage(res.data.message || 'Your email has been updated successfully.');
        toast.success('Email updated successfully!');
      } catch (error: any) {
        setStatus('error');
        setMessage(error?.response?.data?.message || 'The confirmation link is invalid or has expired.');
        toast.error('Email confirmation failed.');
      }
    };

    confirm();
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
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Confirming</h2>
              <p className="text-slate-500 mt-2 text-sm">Please wait while we update your email.</p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Email Updated</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all shadow-md shadow-slate-900/10"
            >
              Go to Settings
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <XCircle size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Confirmation Failed</h2>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">{message}</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all"
            >
              Back to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-pulse text-slate-400 font-medium">Loading...</div>}>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
