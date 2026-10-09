'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IdCard,
  Plus,
  Printer,
  QrCode,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  Users,
  ShieldCheck,
  Calendar,
  Layers,
  Palette,
  ExternalLink,
} from 'lucide-react';
import { idCardsService, IdCard as IdCardType, IdCardDashboardSummary } from '@/services/id-cards.service';

export default function IdCardsManagementPage() {
  const [summary, setSummary] = useState<IdCardDashboardSummary | null>(null);
  const [cards, setCards] = useState<IdCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | 'STUDENT' | 'STAFF'>('ALL');
  const [selectedCard, setSelectedCard] = useState<IdCardType | null>(null);
  const [previewSide, setPreviewSide] = useState<'FRONT' | 'BACK'>('FRONT');

  useEffect(() => {
    fetchData();
  }, [userTypeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, cardsRes] = await Promise.all([
        idCardsService.getDashboardSummary().catch(() => null),
        idCardsService.queryIdCards({
          search: search || undefined,
          userType: userTypeFilter === 'ALL' ? undefined : userTypeFilter,
          limit: 30,
        }).catch(() => ({ items: [], total: 0, totalPages: 1 })),
      ]);
      setSummary(sumRes);
      setCards(cardsRes.items || []);
    } catch (err) {
      console.error('Failed to load ID cards data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handlePrintCard = async (card: IdCardType) => {
    try {
      await idCardsService.markCardPrinted(card.id);
      window.print();
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <IdCard className="w-7 h-7 text-blue-600" />
            Dynamic ID Cards & Credentials Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Design custom layouts, batch generate high-resolution photo ID cards, and verify credentials via secure QR codes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/id-cards/designer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Palette className="w-4 h-4 text-purple-600" />
            Template Designer
          </Link>
          <Link
            href="/certificates"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Certificates Hub
          </Link>
          <Link
            href="/id-cards/generate"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Batch
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cards Issued</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalIdCards ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <IdCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active institutional identity credentials</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active / Verified</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{summary?.activeIdCards ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <QrCode className="w-3.5 h-3.5" />
            <span>QR authentication enabled</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Custom Templates</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{summary?.idCardTemplates ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-600 font-medium">
            <Layers className="w-3.5 h-3.5" />
            <span>Portrait & landscape layouts</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Issued Certificates</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{summary?.totalCertificates ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>TC, Bonafide & Character records</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by card #, student name, roll #, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
              <button
                onClick={() => setUserTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  userTypeFilter === 'ALL' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Cards
              </button>
              <button
                onClick={() => setUserTypeFilter('STUDENT')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  userTypeFilter === 'STUDENT' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setUserTypeFilter('STAFF')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  userTypeFilter === 'STAFF' ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff
              </button>
            </div>

            <Link
              href="/id-cards/generate"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Batch Print Engine
            </Link>
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Generated Institutional ID Cards</h2>
          <span className="text-xs text-slate-500">{cards.length} Records Found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Card Number</th>
                <th className="px-5 py-3">Recipient</th>
                <th className="px-5 py-3">Type & Class / Dept</th>
                <th className="px-5 py-3">Issue Date</th>
                <th className="px-5 py-3">Verification Code</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading institutional ID cards...</span>
                    </div>
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    <IdCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="font-medium text-slate-700">No ID cards generated yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Use the Batch Generate button to produce customized student or staff ID cards with dynamic barcodes and QR codes.
                    </p>
                    <Link
                      href="/id-cards/generate"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Generate First Batch
                    </Link>
                  </td>
                </tr>
              ) : (
                cards.map((c) => {
                  const snapshot: any = c.cardSnapshot || {};
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-blue-600">
                        {c.cardNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs uppercase overflow-hidden">
                            {snapshot.photoUrl ? (
                              <img src={snapshot.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                            ) : (
                              (snapshot.userName || 'U')[0]
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {snapshot.userName || 'Unknown'}
                            </p>
                            <p className="text-xs text-slate-400">
                              {c.userType === 'STUDENT'
                                ? `Adm: ${snapshot.admissionNumber || 'N/A'}`
                                : `Emp: ${snapshot.employeeId || 'N/A'}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            c.userType === 'STUDENT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {c.userType}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.userType === 'STUDENT'
                            ? `${snapshot.className || 'Class'} - ${snapshot.sectionName || 'Sec'}`
                            : `${snapshot.department || 'General'} / ${snapshot.designation || 'Staff'}`}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600 font-medium">
                        {c.issueDate}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.verificationCode}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.status === 'ACTIVE' || c.status === 'ISSUED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.status === 'REVOKED'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedCard(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Preview Digital Card"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintCard(c)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Print Card"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/verify/${c.verificationCode}`}
                            target="_blank"
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            title="Public Verification Portal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Card Preview Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Digital ID Card Preview</h3>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Toggle Front / Back */}
            <div className="flex justify-center">
              <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setPreviewSide('FRONT')}
                  className={`px-4 py-1.5 rounded-md transition-colors ${
                    previewSide === 'FRONT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Front Side
                </button>
                <button
                  onClick={() => setPreviewSide('BACK')}
                  className={`px-4 py-1.5 rounded-md transition-colors ${
                    previewSide === 'BACK' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Back Side
                </button>
              </div>
            </div>

            {/* Rendered Physical-style Card */}
            <div className="flex justify-center py-2">
              <div
                className="w-72 rounded-2xl shadow-xl border border-slate-300 overflow-hidden bg-white text-slate-800 flex flex-col justify-between"
                style={{ height: '420px' }}
              >
                {previewSide === 'FRONT' ? (
                  <>
                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 text-center relative">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl mx-auto flex items-center justify-center font-black text-sm mb-1.5 shadow-xs">
                        🏫
                      </div>
                      <h4 className="font-bold text-xs uppercase tracking-wider">
                        {selectedCard.cardSnapshot?.schoolName || 'Springfield Academy'}
                      </h4>
                      <p className="text-[10px] text-blue-100 opacity-90">
                        {selectedCard.cardSnapshot?.schoolTagline || 'Excellence in Education'}
                      </p>
                    </div>

                    {/* Photo & Basic Info */}
                    <div className="p-4 flex flex-col items-center text-center -mt-6">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-slate-100 overflow-hidden flex items-center justify-center text-2xl font-bold text-slate-600 mb-2">
                        {selectedCard.cardSnapshot?.photoUrl ? (
                          <img
                            src={selectedCard.cardSnapshot.photoUrl}
                            alt="User"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (selectedCard.cardSnapshot?.userName || 'U')[0]
                        )}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {selectedCard.cardSnapshot?.userName}
                      </h3>
                      <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
                        {selectedCard.userType === 'STUDENT'
                          ? `Grade ${selectedCard.cardSnapshot?.className} - Sec ${selectedCard.cardSnapshot?.sectionName}`
                          : `${selectedCard.cardSnapshot?.designation} • ${selectedCard.cardSnapshot?.department}`}
                      </p>

                      {/* Key Attributes */}
                      <div className="w-full mt-3 grid grid-cols-2 gap-1.5 text-left text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">
                            {selectedCard.userType === 'STUDENT' ? 'Adm No' : 'Emp ID'}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {selectedCard.cardSnapshot?.admissionNumber || selectedCard.cardSnapshot?.employeeId || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Blood Group</span>
                          <span className="font-semibold text-rose-600">
                            {selectedCard.cardSnapshot?.bloodGroup || 'O+'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Emergency</span>
                          <span className="font-semibold text-slate-800">
                            {selectedCard.cardSnapshot?.emergencyContact || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Valid Thru</span>
                          <span className="font-semibold text-slate-800">
                            {selectedCard.expiryDate || '2027'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Barcode */}
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
                      <div className="font-mono text-slate-900 tracking-widest text-xs font-bold">
                        ||||| | |||| ||||| || ||||
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">{selectedCard.cardNumber}</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Back Side */}
                    <div className="p-4 space-y-3 flex flex-col justify-between h-full">
                      <div className="text-center">
                        <h4 className="font-bold text-xs text-slate-900 uppercase">Institutional Verification</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          This card is the property of {selectedCard.cardSnapshot?.schoolName}. If found, please return to school office.
                        </p>
                      </div>

                      {/* QR Code Block */}
                      <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-24 h-24 bg-white border-2 border-slate-900 rounded-lg p-1.5 flex flex-col items-center justify-center shadow-xs">
                          <QrCode className="w-full h-full text-slate-900" />
                        </div>
                        <p className="text-[9px] font-mono text-slate-600 mt-2">
                          CODE: {selectedCard.verificationCode}
                        </p>
                      </div>

                      {/* Signature block */}
                      <div className="flex items-end justify-between border-t border-slate-100 pt-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 block text-[8px]">ISSUED BY</span>
                          <span className="font-semibold text-slate-700">Registrar Office</span>
                        </div>
                        <div className="text-right">
                          <div className="w-20 border-b border-slate-800 mb-0.5" />
                          <span className="text-[8px] font-bold text-slate-600 uppercase">Authorized Signatory</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => handlePrintCard(selectedCard)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Physical Card
              </button>
              <Link
                href={`/verify/${selectedCard.verificationCode}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Verify
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
