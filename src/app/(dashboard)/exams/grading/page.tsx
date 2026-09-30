'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Layers,
  Award,
  Trash2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import { examsService, GradingScale, ExamType } from '@/services/exams.service';

export default function ExamGradingConfigurationPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'SCALES' | 'TYPES'>('SCALES');
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State for Grading Scale
  const [scaleForm, setScaleForm] = useState({
    name: '',
    scaleType: 'PERCENTAGE' as 'PERCENTAGE' | 'GPA' | 'GRADE_ONLY',
    description: '',
    isDefault: false,
    ranges: [
      { grade: 'A1', minScore: 91, maxScore: 100, gpaPoint: 10, remarks: 'Outstanding' },
      { grade: 'A2', minScore: 81, maxScore: 90, gpaPoint: 9, remarks: 'Excellent' },
      { grade: 'B1', minScore: 71, maxScore: 80, gpaPoint: 8, remarks: 'Very Good' },
      { grade: 'B2', minScore: 61, maxScore: 70, gpaPoint: 7, remarks: 'Good' },
      { grade: 'C1', minScore: 51, maxScore: 60, gpaPoint: 6, remarks: 'Fair' },
      { grade: 'C2', minScore: 41, maxScore: 50, gpaPoint: 5, remarks: 'Average' },
      { grade: 'D', minScore: 33, maxScore: 40, gpaPoint: 4, remarks: 'Passing' },
      { grade: 'E', minScore: 0, maxScore: 32, gpaPoint: 0, remarks: 'Needs Improvement / Fail' },
    ],
  });

  // Form State for Exam Type
  const [typeForm, setTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    weightage: 100,
  });

  // Queries
  const { data: gradingScales = [], isLoading: isLoadingScales } = useQuery({
    queryKey: ['grading-scales-all'],
    queryFn: () => examsService.getGradingScales(),
  });

  const { data: examTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['exam-types-all'],
    queryFn: () => examsService.getExamTypes(),
  });

  // Mutations
  const createScaleMutation = useMutation({
    mutationFn: (data: Partial<GradingScale>) => examsService.createGradingScale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grading-scales-all'] });
      setIsScaleModalOpen(false);
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to create grading scale.');
    },
  });

  const createTypeMutation = useMutation({
    mutationFn: (data: Partial<ExamType>) => examsService.createExamType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-types-all'] });
      setIsTypeModalOpen(false);
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to create exam type.');
    },
  });

  const handleAddGradeRow = () => {
    setScaleForm({
      ...scaleForm,
      ranges: [
        ...scaleForm.ranges,
        { grade: '', minScore: 0, maxScore: 100, gpaPoint: 0, remarks: '' },
      ],
    });
  };

  const handleRemoveGradeRow = (index: number) => {
    const updated = scaleForm.ranges.filter((_, i) => i !== index);
    setScaleForm({ ...scaleForm, ranges: updated });
  };

  const handleGradeRowChange = (index: number, field: string, val: any) => {
    const updated = [...scaleForm.ranges];
    updated[index] = { ...updated[index], [field]: val };
    setScaleForm({ ...scaleForm, ranges: updated });
  };

  const handleScaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scaleForm.name.trim()) {
      setErrorMsg('Scale name is required.');
      return;
    }
    createScaleMutation.mutate(scaleForm);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeForm.name.trim() || !typeForm.code.trim()) {
      setErrorMsg('Name and Code are required.');
      return;
    }
    createTypeMutation.mutate(typeForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/exams"
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-blue-600" />
              Grading Scales & Assessment Terms
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure institutional grade boundaries, GPA point mappings, and examination term hierarchies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'SCALES' ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setErrorMsg('');
                setIsScaleModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Grading Scale
            </Button>
          ) : (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setErrorMsg('');
                setIsTypeModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Exam Type
            </Button>
          )}
        </div>
      </div>

      {/* Main Tabbed Card */}
      <Card className="p-6 bg-white shadow-sm">
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <button
            onClick={() => setActiveTab('SCALES')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'SCALES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4" />
            Grading Scales ({gradingScales.length})
          </button>
          <button
            onClick={() => setActiveTab('TYPES')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'TYPES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Exam Types & Terms ({examTypes.length})
          </button>
        </div>

        {/* Content */}
        <div className="mt-4">
          {activeTab === 'SCALES' ? (
            <div className="space-y-4">
              {isLoadingScales ? (
                <div className="py-8 text-center text-gray-500">Loading grading scales...</div>
              ) : gradingScales.length === 0 ? (
                <div className="py-8 text-center text-gray-400">No grading scales found. Click &quot;New Grading Scale&quot; above.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gradingScales.map((scale) => (
                    <Card key={scale.id} className="p-5 border border-gray-200 bg-gray-50/50">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-gray-900">{scale.name}</h4>
                            {scale.isDefault && (
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{scale.description || 'Custom scale definition'}</p>
                        </div>
                        <Badge variant="primary">{scale.scaleType}</Badge>
                      </div>

                      {/* Ranges Preview */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                          {scale.ranges?.map((r, i) => (
                            <div key={i} className="p-1.5 bg-white rounded border border-gray-200 text-center">
                              <span className="font-bold text-gray-900">{r.grade}</span>
                              <div className="text-[10px] text-gray-500">{r.minScore}-{r.maxScore}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Exam Term / Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Weightage (%)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {isLoadingTypes ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">Loading exam types...</td>
                    </tr>
                  ) : examTypes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">No exam types configured.</td>
                    </tr>
                  ) : (
                    examTypes.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{t.code}</td>
                        <td className="py-3.5 px-4 font-semibold text-gray-900">{t.name}</td>
                        <td className="py-3.5 px-4 text-gray-500 text-xs">{t.description || '-'}</td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-gray-900">{t.weightage}%</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t.status || 'ACTIVE'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Create Grading Scale Modal */}
      <Modal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        title="Create Institutional Grading Scale"
      >
        <form onSubmit={handleScaleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Scale Name *</label>
            <Input
              placeholder="e.g. CBSE 10-Point Grading System"
              value={scaleForm.name}
              onChange={(e) => setScaleForm({ ...scaleForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Scale Type *</label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                value={scaleForm.scaleType}
                onChange={(e: any) => setScaleForm({ ...scaleForm, scaleType: e.target.value })}
              >
                <option value="PERCENTAGE">Percentage Based (A+, A, B...)</option>
                <option value="GPA">GPA Point System (4.0 or 10.0)</option>
                <option value="GRADE_ONLY">Direct Grades Only</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scaleForm.isDefault}
                  onChange={(e) => setScaleForm({ ...scaleForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                Set as Default School Scale
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Grade Cutoff Thresholds</label>
              <button
                type="button"
                onClick={handleAddGradeRow}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                + Add Grade
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
              {scaleForm.ranges.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Grade (e.g. A+)"
                    value={row.grade}
                    onChange={(e) => handleGradeRowChange(idx, 'grade', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-200 rounded text-center font-bold"
                  />
                  <input
                    type="number"
                    placeholder="Min %"
                    value={row.minScore}
                    onChange={(e) => handleGradeRowChange(idx, 'minScore', Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-center"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max %"
                    value={row.maxScore}
                    onChange={(e) => handleGradeRowChange(idx, 'maxScore', Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-gray-200 rounded text-center"
                  />
                  <input
                    type="text"
                    placeholder="Remarks"
                    value={row.remarks}
                    onChange={(e) => handleGradeRowChange(idx, 'remarks', e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-200 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGradeRow(idx)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScaleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={createScaleMutation.isPending}
            >
              {createScaleMutation.isPending ? 'Saving...' : 'Save Scale'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Exam Type Modal */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title="Create Exam Assessment Term"
      >
        <form onSubmit={handleTypeSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Term / Type Name *</label>
            <Input
              placeholder="e.g. Unit Test 1"
              value={typeForm.name}
              onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Code *</label>
              <Input
                placeholder="e.g. UT1"
                value={typeForm.code}
                onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Annual Weightage (%)</label>
              <Input
                type="number"
                value={typeForm.weightage}
                onChange={(e) => setTypeForm({ ...typeForm, weightage: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Context or assessment guidelines..."
              value={typeForm.description}
              onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTypeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={createTypeMutation.isPending}
            >
              {createTypeMutation.isPending ? 'Saving...' : 'Save Term'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
