'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  Award,
  IdCard,
  QrCode,
  Calendar,
  CheckCircle2,
  Building,
  User,
  GraduationCap,
} from 'lucide-react';
import { idCardsService, IdCard as IdCardType, IssuedCertificate } from '@/services/id-cards.service';

export default function PublicVerificationPage() {
  const params = useParams();
  const code = params?.code as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    valid: boolean;
    card?: IdCardType;
    certificate?: IssuedCertificate;
    message: string;
    type?: 'IDCARD' | 'CERTIFICATE';
  } | null>(null);

  useEffect(() => {
    if (code) {
      verifyCode();
    }
  }, [code]);

  const verifyCode = async () => {
    setLoading(true);
    try {
      // Check ID Card verification first
      const cardRes = await idCardsService.verifyIdCard(code).catch(() => null);
      if (cardRes && cardRes.valid) {
        setResult({
          valid: true,
          card: cardRes.card,
          message: cardRes.message,
          type: 'IDCARD',
        });
        setLoading(false);
        return;
      }

      // If not ID card, check Certificate verification
      const certRes = await idCardsService.verifyCertificate(code).catch(() => null);
      if (certRes && certRes.valid) {
        setResult({
          valid: true,
          certificate: certRes.certificate,
          message: certRes.message,
          type: 'CERTIFICATE',
        });
        setLoading(false);
        return;
      }

      // If neither found
      setResult({
        valid: false,
        message: 'The scanned verification token could not be verified in the institutional authenticity register.',
      });
    } catch (err) {
      setResult({
        valid: false,
        message: 'An error occurred while validating the digital credential.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Verification Emblem */}
        <div className="text-center space-y-2">
          {loading ? (
            <div className="w-16 h-16 rounded-full bg-blue-50 border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
          ) : result?.valid ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-4 border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
              <ShieldCheck className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 border-4 border-rose-500/20 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-9 h-9" />
            </div>
          )}

          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            {loading
              ? 'Verifying Institutional Credential...'
              : result?.valid
              ? 'Authentic Credential Verified'
              : 'Invalid / Revoked Credential'}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            TOKEN: <strong>{code}</strong>
          </p>
        </div>

        {/* Verification Result Details */}
        {!loading && result && (
          <div className="space-y-4">
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold text-center border ${
                result.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {result.message}
            </div>

            {result.type === 'IDCARD' && result.card && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-base text-slate-700 overflow-hidden shadow-2xs">
                    {result.card.cardSnapshot?.photoUrl ? (
                      <img src={result.card.cardSnapshot.photoUrl} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      (result.card.cardSnapshot?.userName || 'U')[0]
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{result.card.cardSnapshot?.userName}</h3>
                    <p className="text-xs text-blue-600 font-semibold uppercase">{result.card.userType} ID CARD</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Card Number</span>
                    <span className="font-mono font-bold text-slate-800">{result.card.cardNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Institution</span>
                    <span className="font-semibold">{result.card.cardSnapshot?.schoolName || 'Springfield Academy'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Class / Role</span>
                    <span className="font-semibold">
                      {result.card.userType === 'STUDENT'
                        ? `Grade ${result.card.cardSnapshot?.className} - ${result.card.cardSnapshot?.sectionName}`
                        : `${result.card.cardSnapshot?.designation}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Status</span>
                    <span className="font-bold text-emerald-600">{result.card.status}</span>
                  </div>
                </div>
              </div>
            )}

            {result.type === 'CERTIFICATE' && result.certificate && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xl shadow-2xs">
                    📜
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {result.certificate.template?.title || 'Official Institutional Certificate'}
                    </h3>
                    <p className="text-xs font-mono text-amber-700 font-bold">
                      {result.certificate.certificateNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Student</span>
                    <span className="font-semibold text-slate-800">
                      {result.certificate.student?.firstName} {result.certificate.student?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Date of Issue</span>
                    <span className="font-semibold">{result.certificate.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Admission Number</span>
                    <span className="font-mono font-semibold">
                      {result.certificate.student?.admissionNumber || result.certificate.student?.studentCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Authentication</span>
                    <span className="font-bold text-emerald-600">OFFICIALLY VERIFIED</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-4 border-t border-slate-100">
          <p className="text-[11px] text-slate-400">
            Powered by School Management ERP Security & Verification Engine
          </p>
        </div>
      </div>
    </div>
  );
}
