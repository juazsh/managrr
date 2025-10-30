import React, { useState } from 'react';
import expenseService from '../../services/expenseService';
import AddExpenseModal from './AddExpenseModal';
import EditExpenseModal from './EditExpenseModal';
import ImageViewer from '../common/ImageViewer';

export const ExpensesSection = ({ projectId, expenses: initialExpenses, summary: initialSummary, canAdd, onExpenseAdded }) => {
  const [expenses, setExpenses] = useState(initialExpenses || []);
  const [summary, setSummary] = useState(initialSummary || {});
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [imageViewerState, setImageViewerState] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  const [paidByFilter, setPaidByFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {};
      if (paidByFilter !== 'all') filters.paidBy = paidByFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;

      const data = await expenseService.getProjectExpenses(projectId, filters);
      setExpenses(data.expenses || []);
      setSummary(data.summary || {});
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchExpenses();
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      setError('');

      const filters = {};
      if (paidByFilter !== 'all') filters.paidBy = paidByFilter;
      if (categoryFilter !== 'all') filters.category = categoryFilter;

      await expenseService.downloadExpensesExcel(projectId, filters);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download expenses');
    } finally {
      setDownloading(false);
    }
  };

  const handleAddExpense = async (expenseData, receiptFile) => {
    try {
      await expenseService.addExpense(expenseData, receiptFile);
      setShowAddModal(false);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to add expense');
    }
  };

  const handleEditExpense = async (expenseId, expenseData, receiptFile) => {
    try {
      await expenseService.updateExpense(expenseId, expenseData, receiptFile);
      setEditingExpense(null);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseService.deleteExpense(expenseId);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete expense. Please try again.');
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      materials: '🔨 Materials',
      labor: '👷 Labor',
      equipment: '🛠️ Equipment',
      other: '📦 Other',
    };
    return labels[category] || category;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-semibold text-text m-0">Expenses</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleDownloadExcel}
            className={`px-5 py-2.5 border rounded-md text-base font-medium cursor-pointer transition-all duration-200 ${
              downloading
                ? 'bg-background text-text-light border-border cursor-not-allowed opacity-60'
                : 'bg-white text-primary border-primary'
            }`}
            disabled={downloading}
          >
            {downloading ? '⏳ Downloading...' : '📥 Download Excel'}
          </button>
          {canAdd && (
            <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-primary text-white border-0 rounded-md text-base font-medium cursor-pointer transition-all duration-200">
              + Add Expense
            </button>
          )}
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 border border-red-200">{error}</div>}

      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-semibold text-text mb-4">Expense Summary</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-light font-medium">Total Spent</span>
            <span className="text-2xl font-semibold text-text">${summary.total_spent?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-light font-medium">Owner Paid</span>
            <span className="text-2xl font-semibold text-primary">${summary.total_by_owner?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-light font-medium">Contractor Paid</span>
            <span className="text-2xl font-semibold text-[#8B5CF6]">${summary.total_by_contractor?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 p-5 bg-white rounded-lg flex-wrap shadow-sm">
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-text">Paid By</label>
          <select
            value={paidByFilter}
            onChange={(e) => setPaidByFilter(e.target.value)}
            className="p-2 rounded-md border border-border text-base bg-white"
          >
            <option value="all">All</option>
            <option value="owner">Owner</option>
            <option value="contractor">Contractor</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-sm font-medium text-text">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 rounded-md border border-border text-base bg-white"
          >
            <option value="all">All Categories</option>
            <option value="materials">🔨 Materials</option>
            <option value="labor">👷 Labor</option>
            <option value="equipment">🛠️ Equipment</option>
            <option value="other">📦 Other</option>
          </select>
        </div>

        <button onClick={handleApplyFilters} className="self-end px-6 py-2 bg-primary text-white border-0 rounded-md text-base font-medium cursor-pointer transition-all duration-200">
          Apply Filters
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center p-8 text-text-light">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-lg">
            <div className="text-lg text-text-light mb-2">No expenses found</div>
            {canAdd && (
              <div className="text-sm text-text-light">Click "Add Expense" to record your first expense</div>
            )}
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="bg-white rounded-lg p-6 shadow-sm transition-all duration-200">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-2xl font-semibold text-text m-0">${expense.amount.toFixed(2)}</h3>
                  <p className="text-base text-text m-0">{expense.vendor}</p>
                  <p className="text-sm text-text-light m-0">
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <span className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-background">
                    {getCategoryLabel(expense.category)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap text-white ${
                      expense.paid_by === 'owner' ? 'bg-primary' : 'bg-[#8B5CF6]'
                    }`}
                  >
                    {expense.paid_by === 'owner' ? '👤 Owner' : '🔧 Contractor'}
                  </span>
                </div>
              </div>

              {expense.description && <p className="text-base text-text mb-4 leading-relaxed">{expense.description}</p>}

              {expense.receipt_url && (
                <div
                  className="relative mb-4 inline-block rounded-md overflow-hidden"
                  onMouseEnter={(e) => {
                    const overlay = e.currentTarget.querySelector('[data-overlay]');
                    if (overlay) overlay.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const overlay = e.currentTarget.querySelector('[data-overlay]');
                    if (overlay) overlay.style.opacity = '0';
                  }}
                >
                  <img
                    src={expense.receipt_url}
                    alt="Receipt"
                    className="max-w-[300px] w-full h-auto rounded-md cursor-pointer transition-all duration-200 block"
                  />
                  <div data-overlay className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center gap-4 opacity-0 transition-opacity duration-200">
                    <button
                      className="w-12 h-12 bg-white/90 border-0 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 text-text hover:bg-white hover:scale-110"
                      onClick={() => setImageViewerState({
                        isOpen: true,
                        images: [{ url: expense.receipt_url, caption: `Receipt - ${expense.vendor}` }],
                        initialIndex: 0,
                      })}
                    >
                      🔍
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-border">
                <span className="text-sm text-text-light">Added by {expense.added_by_name}</span>
                {canAdd && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="px-4 py-2 bg-background text-text border border-border rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddExpenseModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddExpense}
        />
      )}

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleEditExpense}
        />
      )}

      {imageViewerState.isOpen && (
        <ImageViewer
          images={imageViewerState.images}
          initialIndex={imageViewerState.initialIndex}
          onClose={() => setImageViewerState({ isOpen: false, images: [], initialIndex: 0 })}
        />
      )}
    </div>
  );
};

export default ExpensesSection;
