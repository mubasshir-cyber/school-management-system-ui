'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  ArrowLeft,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  Sparkles,
  FileText,
  Copy,
} from 'lucide-react';
import {
  idCardsService,
  CertificateTemplate,
  CertificateType,
} from '@/services/id-cards.service';

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: 'Official Transfer Certificate Template',
    certificateType: 'TRANSFER' as CertificateType,
    title: 'TRANSFER CERTIFICATE / SCHOOL LEAVING CERTIFICATE',
    subTitle: 'Recognized by the Ministry of Education',
    bodyTemplate:
      'This is to certify that {{student_name}}, son/daughter of {{father_name}} and {{mother_name}}, was a bonafide student of this institution in Class {{class}} (Section {{section}}) during the academic year {{academic_year}}. According to school records, the date of birth is {{dob}}. The student has paid all institutional dues up to date and bears a {{conduct}} moral character.',
    signatoryTitle1: 'Class Teacher',
    signatoryTitle2: 'Principal',
    borderStyle: 'CLASSIC_DOUBLE',
    primaryColor: '#1e3a8a',
    includeQrCode: true,
  });

  const placeholderTokens = [
    '{{student_name}}',
    '{{admission_no}}',
    '{{roll_no}}',
    '{{class}}',
    '{{section}}',
    '{{father_name}}',
    '{{mother_name}}',
    '{{dob}}',
    '{{gender}}',
    '{{academic_year}}',
    '{{issue_date}}',
    '{{reason}}',
    '{{conduct}}',
    '{{leaving_date}}',
    '{{promoted_to}}',
    '{{school_name}}',
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await idCardsService.getCertificateTemplates();
      setTemplates(res || []);
      if (res && res.length > 0) {
        loadTemplate(res[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadTemplate = (t: CertificateTemplate) => {
    setSelectedId(t.id);
    setFormData({
      name: t.name,
      certificateType: t.certificateType,
      title: t.title,
      subTitle: t.subTitle || '',
      bodyTemplate: t.bodyTemplate,
      signatoryTitle1: t.signatoryTitle1 || 'Class Teacher',
      signatoryTitle2: t.signatoryTitle2 || 'Principal',
      borderStyle: t.borderStyle || 'CLASSIC_DOUBLE',
      primaryColor: t.primaryColor || '#1e3a8a',
      includeQrCode: t.includeQrCode ?? true,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      if (selectedId) {
        await idCardsService.updateCertificateTemplate(selectedId, formData);
        setSuccessMsg('Template updated successfully!');
      } else {
        const created = await idCardsService.createCertificateTemplate(formData);
        setSelectedId(created.id);
        setSuccessMsg('New certificate template created!');
      }
      loadTemplates();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setSelectedId(null);
    setFormData({
      name: 'New Custom Certificate Template',
      certificateType: 'BONAFIDE',
      title: 'BONAFIDE CERTIFICATE',
      subTitle: 'Official Institutional Statement',
      bodyTemplate:
        'This is to certify that {{student_name}}, bearing Admission No {{admission_no}}, is a bonafide student of Class {{class}} at this institution for the session {{academic_year}}.',
      signatoryTitle1: 'Verified by Office',
      signatoryTitle2: 'Principal',
      borderStyle: 'CLASSIC_DOUBLE',
      primaryColor: '#047857',
      includeQrCode: true,
    });
  };

  const insertToken = (token: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyTemplate: prev.bodyTemplate + ' ' + token,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/certificates"
            className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-purple-600" />
              Certificate Template Manager
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Customize dynamic wording, placeholder tokens, headers, and signatory labels for school documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNew}
            className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            + New Template
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

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Grid: Editor + Token Chips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
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
                  Certificate Classification *
                </label>
                <select
                  value={formData.certificateType}
                  onChange={(e) =>
                    setFormData({ ...formData, certificateType: e.target.value as CertificateType })
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="TRANSFER">Transfer Certificate (TC)</option>
                  <option value="BONAFIDE">Bonafide Certificate</option>
                  <option value="CHARACTER">Character Certificate</option>
                  <option value="MERIT">Academic Merit Certificate</option>
                  <option value="SPORTS">Sports & Activity Certificate</option>
                  <option value="CUSTOM">Custom Document</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Document Main Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Document Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Body Template (Supports Dynamic Variables) *
              </label>
              <textarea
                rows={6}
                required
                value={formData.bodyTemplate}
                onChange={(e) => setFormData({ ...formData, bodyTemplate: e.target.value })}
                className="w-full p-3 text-sm font-serif border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Signatory Title 1 (Left)</label>
                <input
                  type="text"
                  value={formData.signatoryTitle1}
                  onChange={(e) => setFormData({ ...formData, signatoryTitle1: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Signatory Title 2 (Right)</label>
                <input
                  type="text"
                  value={formData.signatoryTitle2}
                  onChange={(e) => setFormData({ ...formData, signatoryTitle2: e.target.value })}
                  className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Right Token Helper & Saved Presets */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Dynamic Variable Tags
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any token below to automatically append it to your body template.
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pt-1">
              {placeholderTokens.map((tok) => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => insertToken(tok)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 rounded-md font-mono text-[11px] text-blue-700 transition-colors shadow-2xs"
                >
                  <Copy className="w-3 h-3 text-slate-400" />
                  {tok}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Existing Templates</h3>
            <div className="divide-y divide-slate-100">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => loadTemplate(t)}
                  className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    selectedId === t.id
                      ? 'bg-purple-50 text-purple-700 font-bold border border-purple-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{t.name}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{t.certificateType}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
