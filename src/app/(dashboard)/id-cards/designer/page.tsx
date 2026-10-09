'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Palette,
  ArrowLeft,
  Save,
  Check,
  IdCard,
  QrCode,
  Sparkles,
  Layers,
  Sliders,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { idCardsService, IdCardTemplate, IdCardLayout, IdCardUserType } from '@/services/id-cards.service';

export default function IdCardDesignerPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewSide, setPreviewSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: 'Standard Student ID Card 2026',
    userType: 'STUDENT' as IdCardUserType,
    layout: 'PORTRAIT' as IdCardLayout,
    headerBgColor: '#1e40af',
    headerTextColor: '#ffffff',
    bgColor: '#ffffff',
    accentColor: '#3b82f6',
    schoolName: 'Springfield International Academy',
    schoolTagline: 'Excellence in Education',
    schoolAddress: '123 Education Boulevard, Metro City',
    includeQrCode: true,
    includeBarcode: true,
    includeBloodGroup: true,
    includeEmergencyContact: true,
    includeAddress: true,
    includeSignature: true,
    signatureTitle: 'Principal Signature',
    isDefault: true,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await idCardsService.getIdCardTemplates();
      setTemplates(res || []);
      if (res && res.length > 0) {
        loadTemplateIntoForm(res[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTemplateIntoForm = (t: IdCardTemplate) => {
    setSelectedTemplateId(t.id);
    setFormData({
      name: t.name,
      userType: t.userType,
      layout: t.layout,
      headerBgColor: t.headerBgColor || '#1e40af',
      headerTextColor: t.headerTextColor || '#ffffff',
      bgColor: t.bgColor || '#ffffff',
      accentColor: t.accentColor || '#3b82f6',
      schoolName: t.schoolName || 'Springfield International Academy',
      schoolTagline: t.schoolTagline || 'Excellence in Education',
      schoolAddress: t.schoolAddress || '123 Education Boulevard, Metro City',
      includeQrCode: t.includeQrCode ?? true,
      includeBarcode: t.includeBarcode ?? true,
      includeBloodGroup: t.includeBloodGroup ?? true,
      includeEmergencyContact: t.includeEmergencyContact ?? true,
      includeAddress: t.includeAddress ?? true,
      includeSignature: t.includeSignature ?? true,
      signatureTitle: t.signatureTitle || 'Principal Signature',
      isDefault: t.isDefault ?? false,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      if (selectedTemplateId) {
        await idCardsService.updateIdCardTemplate(selectedTemplateId, formData);
        setSuccessMessage('Template updated successfully!');
      } else {
        const created = await idCardsService.createIdCardTemplate(formData);
        setSelectedTemplateId(created.id);
        setSuccessMessage('New template created successfully!');
      }
      loadTemplates();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplateId(null);
    setFormData({
      name: 'New Custom ID Card Template',
      userType: 'STUDENT',
      layout: 'PORTRAIT',
      headerBgColor: '#0f172a',
      headerTextColor: '#ffffff',
      bgColor: '#ffffff',
      accentColor: '#0284c7',
      schoolName: 'Springfield International Academy',
      schoolTagline: 'Empowering Future Leaders',
      schoolAddress: '123 Education Boulevard, Metro City',
      includeQrCode: true,
      includeBarcode: true,
      includeBloodGroup: true,
      includeEmergencyContact: true,
      includeAddress: true,
      includeSignature: true,
      signatureTitle: 'Authorized Signatory',
      isDefault: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/id-cards"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Palette className="w-7 h-7 text-purple-600" />
              Dynamic ID Card Designer & Layout Studio
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Customize colors, dimensions, barcodes, security QR codes, and physical branding attributes in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            + Create New Template
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Main Grid: Controls vs Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Config Panel */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            Card Configuration Settings
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Recipient User Type
                </label>
                <select
                  value={formData.userType}
                  onChange={(e) => setFormData({ ...formData, userType: e.target.value as IdCardUserType })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="STUDENT">Student Card</option>
                  <option value="STAFF">Staff & Faculty Card</option>
                  <option value="GUARDIAN">Guardian Pick-up Card</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Card Orientation / Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, layout: 'PORTRAIT' })}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      formData.layout === 'PORTRAIT'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Portrait (Vertical)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, layout: 'LANDSCAPE' })}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-all ${
                      formData.layout === 'LANDSCAPE'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Landscape (Horizontal)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Default For {formData.userType}
                </label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 font-medium">Use as primary default template</span>
                </label>
              </div>
            </div>

            {/* School Branding Fields */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Institution Branding</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Institution Tagline</label>
                  <input
                    type="text"
                    value={formData.schoolTagline}
                    onChange={(e) => setFormData({ ...formData, schoolTagline: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Color Palette Controls */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Palette & Styling</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Header Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.headerBgColor}
                      onChange={(e) => setFormData({ ...formData, headerBgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{formData.headerBgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Header Text</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.headerTextColor}
                      onChange={(e) => setFormData({ ...formData, headerTextColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{formData.headerTextColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Card Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{formData.bgColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Accent Theme</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <span className="text-xs font-mono text-slate-600">{formData.accentColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature & Field Toggles */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Display Fields & Security Elements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.includeQrCode}
                    onChange={(e) => setFormData({ ...formData, includeQrCode: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>QR Verification Code</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.includeBarcode}
                    onChange={(e) => setFormData({ ...formData, includeBarcode: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Scan Barcode</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.includeBloodGroup}
                    onChange={(e) => setFormData({ ...formData, includeBloodGroup: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Blood Group Badge</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.includeEmergencyContact}
                    onChange={(e) => setFormData({ ...formData, includeEmergencyContact: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Emergency Phone</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.includeAddress}
                    onChange={(e) => setFormData({ ...formData, includeAddress: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Residential Address</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer text-xs font-medium text-slate-700 hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.includeSignature}
                    onChange={(e) => setFormData({ ...formData, includeSignature: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>Signatory Line</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Panel: Live Real-time Render View */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-between shadow-xs">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live WYSIWYG Card Preview</span>
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPreviewSide('FRONT')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewSide === 'FRONT' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setPreviewSide('BACK')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  previewSide === 'BACK' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Back
              </button>
            </div>
          </div>

          {/* Rendered Preview Box */}
          <div className="py-4 flex justify-center w-full">
            {formData.layout === 'PORTRAIT' ? (
              <div
                className="w-72 rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between transition-all"
                style={{ height: '420px', backgroundColor: formData.bgColor }}
              >
                {previewSide === 'FRONT' ? (
                  <>
                    <div
                      className="p-4 text-center relative"
                      style={{ backgroundColor: formData.headerBgColor, color: formData.headerTextColor }}
                    >
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl mx-auto flex items-center justify-center font-black text-sm mb-1.5 shadow-xs">
                        🏫
                      </div>
                      <h4 className="font-bold text-xs uppercase tracking-wider leading-tight">
                        {formData.schoolName || 'School Name'}
                      </h4>
                      <p className="text-[10px] opacity-90">{formData.schoolTagline || 'Excellence in Education'}</p>
                    </div>

                    <div className="p-4 flex flex-col items-center text-center -mt-6">
                      <div className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-slate-100 overflow-hidden flex items-center justify-center text-2xl font-bold text-slate-600 mb-2">
                        {formData.userType === 'STUDENT' ? '🎓' : '👨‍🏫'}
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        {formData.userType === 'STUDENT' ? 'Alexander Wright' : 'Prof. Marcus Vance'}
                      </h3>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-wide"
                        style={{ color: formData.accentColor }}
                      >
                        {formData.userType === 'STUDENT' ? 'Grade 10 - Section A' : 'Senior Mathematics Faculty'}
                      </p>

                      <div className="w-full mt-3 grid grid-cols-2 gap-1.5 text-left text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">
                            {formData.userType === 'STUDENT' ? 'Adm No' : 'Emp ID'}
                          </span>
                          <span className="font-semibold text-slate-800">
                            {formData.userType === 'STUDENT' ? 'ADM-2026-0842' : 'EMP-2026-0041'}
                          </span>
                        </div>
                        {formData.includeBloodGroup && (
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Blood Group</span>
                            <span className="font-semibold text-rose-600">B+ Positive</span>
                          </div>
                        )}
                        {formData.includeEmergencyContact && (
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-bold">Emergency</span>
                            <span className="font-semibold text-slate-800">+1 555 234 5678</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Valid Thru</span>
                          <span className="font-semibold text-slate-800">March 2027</span>
                        </div>
                      </div>
                    </div>

                    {formData.includeBarcode && (
                      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-col items-center">
                        <div className="font-mono text-slate-900 tracking-widest text-xs font-bold">
                          ||||| | |||| ||||| || ||||
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">IDC-STU-2026-92841</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 space-y-3 flex flex-col justify-between h-full">
                    <div className="text-center">
                      <h4 className="font-bold text-xs text-slate-900 uppercase">Institutional Verification</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        This card remains property of {formData.schoolName}. If found, please return to school office.
                      </p>
                    </div>

                    {formData.includeQrCode && (
                      <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="w-24 h-24 bg-white border-2 border-slate-900 rounded-lg p-1.5 flex flex-col items-center justify-center shadow-xs">
                          <QrCode className="w-full h-full text-slate-900" />
                        </div>
                        <p className="text-[9px] font-mono text-slate-600 mt-2">
                          VERIFICATION CODE: VERIF-9A8F2C
                        </p>
                      </div>
                    )}

                    {formData.includeSignature && (
                      <div className="flex items-end justify-between border-t border-slate-100 pt-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 block text-[8px]">ISSUED BY</span>
                          <span className="font-semibold text-slate-700">Registrar Office</span>
                        </div>
                        <div className="text-right">
                          <div className="w-20 border-b border-slate-800 mb-0.5" />
                          <span className="text-[8px] font-bold text-slate-600 uppercase">
                            {formData.signatureTitle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Landscape Card Preview */
              <div
                className="w-96 rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between transition-all"
                style={{ height: '240px', backgroundColor: formData.bgColor }}
              >
                {previewSide === 'FRONT' ? (
                  <>
                    <div
                      className="px-4 py-2 flex items-center justify-between"
                      style={{ backgroundColor: formData.headerBgColor, color: formData.headerTextColor }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏫</span>
                        <h4 className="font-bold text-xs uppercase tracking-wider">{formData.schoolName}</h4>
                      </div>
                      <span className="text-[9px] opacity-80 uppercase font-semibold">{formData.userType}</span>
                    </div>

                    <div className="p-3 flex items-center gap-4 flex-1">
                      <div className="w-20 h-20 rounded-xl border-2 border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-600 shadow-xs">
                        {formData.userType === 'STUDENT' ? '🎓' : '👨‍🏫'}
                      </div>
                      <div className="flex-1 text-left space-y-1">
                        <h3 className="font-extrabold text-slate-900 text-sm">Alexander Wright</h3>
                        <p className="text-[11px] font-semibold" style={{ color: formData.accentColor }}>
                          {formData.userType === 'STUDENT' ? 'Grade 10 - Sec A' : 'Mathematics Faculty'}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 pt-1">
                          <span>
                            <strong>ID:</strong> ADM-2026-0842
                          </span>
                          <span>
                            <strong>Blood:</strong> B+
                          </span>
                        </div>
                      </div>
                    </div>

                    {formData.includeBarcode && (
                      <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="font-mono text-slate-500 font-bold">||||| | |||| |||||</span>
                        <span className="text-slate-400 font-mono">IDC-STU-2026-92841</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 flex items-center justify-between h-full gap-4">
                    <div className="flex-1 text-[10px] text-slate-600 space-y-2">
                      <h5 className="font-bold uppercase text-slate-900">Terms of ID Card</h5>
                      <p className="text-[9px]">Property of {formData.schoolName}. Return if found.</p>
                      <p className="text-[9px] font-mono">Emergency: +1 555 234 5678</p>
                    </div>
                    {formData.includeQrCode && (
                      <div className="w-20 h-20 bg-white border border-slate-300 rounded-lg p-1 flex items-center justify-center">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template presets switcher */}
          <div className="w-full mt-4 pt-3 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-600 block mb-2">Saved Layout Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => loadTemplateIntoForm(t)}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                    selectedTemplateId === t.id
                      ? 'bg-purple-50 text-purple-700 border-purple-300 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
