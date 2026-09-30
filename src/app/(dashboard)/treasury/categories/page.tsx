'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tags, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  CheckCircle2, 
  Search, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { treasuryService, IncomeCategory, ExpenseCategory } from '@/services/treasury.service';

export default function TreasuryCategoriesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Queries
  const { data: incomeCategories = [], isLoading: isLoadingIncome } = useQuery({
    queryKey: ['treasury-income-categories'],
    queryFn: () => treasuryService.getIncomeCategories(),
  });

  const { data: expenseCategories = [], isLoading: isLoadingExpense } = useQuery({
    queryKey: ['treasury-expense-categories'],
    queryFn: () => treasuryService.getExpenseCategories(),
  });

  // Mutations
  const createIncomeMutation = useMutation({
    mutationFn: (data: Partial<IncomeCategory>) => treasuryService.createIncomeCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury-income-categories'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to create income category');
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: Partial<ExpenseCategory>) => treasuryService.createExpenseCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasury-expense-categories'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || 'Failed to create expense category');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', code: '', description: '' });
    setErrorMsg('');
  };

  const handleOpenModal = (type: 'INCOME' | 'EXPENSE') => {
    setModalType(type);
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setErrorMsg('Name and Code are required');
      return;
    }

    if (modalType === 'INCOME') {
      createIncomeMutation.mutate(formData);
    } else {
      createExpenseMutation.mutate(formData);
    }
  };

  const filteredIncome = incomeCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpense = expenseCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Tags className="w-7 h-7 text-blue-600" />
            Treasury Chart of Accounts & Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure institutional chart of accounts for non-fee revenues, grants, operational expenditures, and departmental budgets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={() => handleOpenModal('INCOME')}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Income Head
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleOpenModal('EXPENSE')}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Expense Head
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Income Categories</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{incomeCategories.length}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Non-fee revenue streams</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-rose-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Expense Categories</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{expenseCategories.length}</h3>
              <p className="text-xs text-rose-600 font-medium mt-1">Expenditure ledger heads</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-blue-500 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Ledger Heads</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{incomeCategories.length + expenseCategories.length}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">Active ledger classification</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs and Search */}
      <Card className="p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('INCOME')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Income Categories ({incomeCategories.length})
            </button>
            <button
              onClick={() => setActiveTab('EXPENSE')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Expense Categories ({expenseCategories.length})
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="mt-4 overflow-x-auto">
          {activeTab === 'INCOME' ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {isLoadingIncome ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">Loading categories...</td>
                  </tr>
                ) : filteredIncome.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No income categories found.
                    </td>
                  </tr>
                ) : (
                  filteredIncome.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-emerald-700">{cat.code}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{cat.name}</td>
                      <td className="py-3.5 px-4 text-gray-500">{cat.description || '-'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {cat.status || 'ACTIVE'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {isLoadingExpense ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">Loading categories...</td>
                  </tr>
                ) : filteredExpense.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No expense categories found.
                    </td>
                  </tr>
                ) : (
                  filteredExpense.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-rose-700">{cat.code}</td>
                      <td className="py-3.5 px-4 font-semibold text-gray-900">{cat.name}</td>
                      <td className="py-3.5 px-4 text-gray-500">{cat.description || '-'}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant="primary">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {cat.status || 'ACTIVE'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Create Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalType === 'INCOME' ? 'Create Non-Fee Income Head' : 'Create Expense Ledger Head'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category / Ledger Name *
            </label>
            <Input
              placeholder={modalType === 'INCOME' ? 'e.g. Government Grants & Subsidies' : 'e.g. Science Lab Consumables'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Ledger Code *
            </label>
            <Input
              placeholder={modalType === 'INCOME' ? 'e.g. INC-GRANT-01' : 'e.g. EXP-LAB-01'}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description / Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Provide context or account policy details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={modalType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
              disabled={createIncomeMutation.isPending || createExpenseMutation.isPending}
            >
              {(createIncomeMutation.isPending || createExpenseMutation.isPending) ? 'Saving...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
