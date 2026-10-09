'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  Printer,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  FileText,
  Sparkles,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  idCardsService,
  IssuedCertificate,
  CertificateTemplate,
  CertificateType,
} from '@/services/id-cards.service';

export default function CertificatesManagementPage() {
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<CertificateType | 'ALL'>('ALL');
  const [previewCert, setPreviewCert] = useState<IssuedCertificate | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certRes, tempRes] = await Promise.all([
        idCardsService.queryCertificates({
          search: search || undefined,
          certificateType: selectedType === 'ALL' ? undefined : selectedType,
          limit: 30,
        }).catch(() => ({ items: [], total: 0, totalPages: 1 })),
        idCardsService.getCertificateTemplates().catch(() => []),
      ]);
      setCertificates(certRes.items || []);
      setTemplates(tempRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-7 h-7 text-emerald-600" />
            Official Certificates & Credentials Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Issue and verify Transfer Certificates (TC), Bonafide Certificates, Character Certificates, and Sports Merits.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/certificates/templates"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Layers className="w-4 h-4 text-purple-600" />
            Manage Templates
          </Link>
          <Link
            href="/certificates/issue"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Issue New Certificate
          </Link>
        </div>
      </div>

      {/* Quick Type Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedType('TRANSFER')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedType === 'TRANSFER'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm mb-2">
            TC
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Transfer Certificates</h3>
          <p className="text-xs text-slate-500 mt-0.5">School Leaving Records</p>
        </button>

        <button
          onClick={() => setSelectedType('BONAFIDE')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedType === 'BONAFIDE'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-sm mb-2">
            BN
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Bonafide Certificates</h3>
          <p className="text-xs text-slate-500 mt-0.5">Student Verification</p>
        </button>

        <button
          onClick={() => setSelectedType('CHARACTER')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedType === 'CHARACTER'
              ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center font-bold text-sm mb-2">
            CC
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Character Certificates</h3>
          <p className="text-xs text-slate-500 mt-0.5">Conduct Endorsement</p>
        </button>

        <button
          onClick={() => setSelectedType('ALL')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedType === 'ALL'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold text-sm mb-2">
            ★
          </div>
          <h3 className="font-bold text-slate-900 text-sm">All Certificates</h3>
          <p className="text-xs text-slate-500 mt-0.5">Complete Archive</p>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by certificate #, student name, verification code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </form>
      </div>

      {/* Certificates Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Issued Certificate Archive</h2>
          <span className="text-xs text-slate-500">{certificates.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Certificate Number</th>
                <th className="px-5 py-3">Recipient Student</th>
                <th className="px-5 py-3">Certificate Type</th>
                <th className="px-5 py-3">Issue Date</th>
                <th className="px-5 py-3">Verification Code</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Loading certificate archive...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-700">No certificates issued yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Generate official Transfer Certificates (TC) or Bonafide records with dynamic student placeholders.
                    </p>
                    <Link
                      href="/certificates/issue"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Issue First Certificate
                    </Link>
                  </td>
                </tr>
              ) : (
                certificates.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-emerald-700">
                      {c.certificateNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {c.student ? `${c.student.firstName} ${c.student.lastName}` : 'N/A'}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {c.student?.admissionNumber || c.student?.studentCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.template?.certificateType || 'CERTIFICATE'}
                      </span>
                      <p className="text-xs text-slate-500 mt-0.5">{c.template?.title}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">{c.issueDate}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.verificationCode}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewCert(c)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Official Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setPreviewCert(c);
                            setTimeout(() => window.print(), 300);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Print Document"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/verify/${c.verificationCode}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                          title="Verify Credential"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Certificate Modal / Print Preview */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Institutional Certificate Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Document
                </button>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Certificate Paper Sheet */}
            <div className="border-8 border-double border-amber-900/40 p-8 rounded-xl bg-amber-50/20 text-slate-900 relative space-y-6">
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="w-16 h-16 bg-blue-900 text-white rounded-full mx-auto flex items-center justify-center font-black text-2xl mb-2 shadow-sm">
                  🏛️
                </div>
                <h2 className="text-2xl font-serif font-black uppercase tracking-wider text-blue-950">
                  Springfield International Academy
                </h2>
                <p className="text-xs font-sans text-slate-600 font-medium">
                  Affiliated to Central Board of Secondary Education • School Code: 10482
                </p>
                <div className="w-36 h-1 bg-amber-600 mx-auto mt-2 rounded-full" />
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <span className="inline-block px-4 py-1 border border-amber-700/60 bg-amber-100/50 rounded-md font-serif font-bold text-sm tracking-widest text-amber-950 uppercase">
                  {previewCert.template?.title || 'TRANSFER CERTIFICATE'}
                </span>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Certificate No: <strong>{previewCert.certificateNumber}</strong>
                </p>
              </div>

              {/* Body Content */}
              <div className="font-serif leading-relaxed text-slate-800 text-sm space-y-4 px-4 text-justify">
                <p className="indent-8">
                  {previewCert.renderedContent ||
                    `This is to certify that ${previewCert.student?.firstName} ${previewCert.student?.lastName} was a bonafide student of this institution.`}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-white/70 p-4 rounded-lg border border-amber-200/60 my-4">
                  <div>
                    <span className="text-slate-500 block">Admission Number:</span>
                    <span className="font-semibold font-mono">{previewCert.student?.admissionNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date of Leaving:</span>
                    <span className="font-semibold">{previewCert.leavingDate || previewCert.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">General Conduct:</span>
                    <span className="font-semibold text-emerald-700">{previewCert.conductRemarks || 'Exemplary'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Promoted to Class:</span>
                    <span className="font-semibold">{previewCert.promotedToClass || 'Passed and Advanced'}</span>
                  </div>
                </div>
              </div>

              {/* Footer Signatories & QR */}
              <div className="flex items-end justify-between pt-8 border-t border-amber-200/70 text-xs px-4">
                <div className="text-center">
                  <div className="w-28 border-b border-slate-700 mb-1" />
                  <span className="font-bold text-slate-800 uppercase text-[10px]">
                    {previewCert.template?.signatoryTitle1 || 'Class Teacher'}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 border border-slate-400 p-1 rounded bg-white">
                    <QrCode className="w-full h-full text-slate-900" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">{previewCert.verificationCode}</span>
                </div>

                <div className="text-center">
                  <div className="w-28 border-b border-slate-700 mb-1" />
                  <span className="font-bold text-slate-800 uppercase text-[10px]">
                    {previewCert.template?.signatoryTitle2 || 'Principal / Headmaster'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
