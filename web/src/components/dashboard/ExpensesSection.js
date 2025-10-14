import React, { useState } from 'react';
import { theme } from '../../theme';
import expenseService from '../../services/expenseService';
import AddExpenseModal from './AddExpenseModal';
import EditExpenseModal from './EditExpenseModal';

export const ExpensesSection = ({ projectId, expenses: initialExpenses, summary: initialSummary, canAdd, onExpenseAdded }) => {
  const [expenses, setExpenses] = useState(initialExpenses || []);
  const [summary, setSummary] = useState(initialSummary || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expenseService.deleteExpense(expenseId);
      if (onExpenseAdded) onExpenseAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete expense');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  if (loading) {
    return <div style={styles.loading}>Loading expenses...</div>;
  }

  const filteredExpenses = expenses.filter(expense => {
    if (paidByFilter !== 'all' && expense.paid_by !== paidByFilter) return false;
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
    return true;
  });

  const calculateTotals = () => {
    const totals = {
      total: 0,
      byOwner: 0,
      byContractor: 0,
      byCategory: {},
    };

    filteredExpenses.forEach(expense => {
      totals.total += expense.amount;
      
      if (expense.paid_by === 'owner') {
        totals.byOwner += expense.amount;
      } else if (expense.paid_by === 'contractor') {
        totals.byContractor += expense.amount;
      }

      if (!totals.byCategory[expense.category]) {
        totals.byCategory[expense.category] = 0;
      }
      totals.byCategory[expense.category] += expense.amount;
    });

    return totals;
  };

  const displayTotals = calculateTotals();

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>Expenses</h2>
        {canAdd && (
          <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
            + Add Expense
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Spent</div>
          <div style={styles.summaryValue}>{formatCurrency(displayTotals.total)}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Owner Paid</div>
          <div style={{...styles.summaryValue, color: theme.colors.primary}}>
            {formatCurrency(displayTotals.byOwner)}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Contractor Paid</div>
          <div style={{...styles.summaryValue, color: theme.colors.secondary}}>
            {formatCurrency(displayTotals.byContractor)}
          </div>
        </div>
      </div>

      {Object.keys(displayTotals.byCategory).length > 0 && (
        <div style={styles.categoryBreakdown}>
          <h3 style={styles.breakdownTitle}>By Category</h3>
          <div style={styles.categoryGrid}>
            {Object.entries(displayTotals.byCategory).map(([category, amount]) => (
              <div key={category} style={styles.categoryItem}>
                <span style={styles.categoryLabel}>{getCategoryLabel(category)}</span>
                <span style={styles.categoryAmount}>{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Paid By:</label>
          <div style={styles.filterButtons}>
            <button
              style={paidByFilter === 'all' ? {...styles.filterButton, ...styles.filterButtonActive} : styles.filterButton}
              onClick={() => setPaidByFilter('all')}
            >
              All
            </button>
            <button
              style={paidByFilter === 'owner' ? {...styles.filterButton, ...styles.filterButtonActive} : styles.filterButton}
              onClick={() => setPaidByFilter('owner')}
            >
              Owner
            </button>
            <button
              style={paidByFilter === 'contractor' ? {...styles.filterButton, ...styles.filterButtonActive} : styles.filterButton}
              onClick={() => setPaidByFilter('contractor')}
            >
              Contractor
            </button>
          </div>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category:</label>
          <select
            style={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="materials">Materials</option>
            <option value="labor">Labor</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div style={styles.expenseList}>
        {filteredExpenses.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No expenses found</p>
            <p style={styles.emptyHint}>Add your first expense to start tracking project costs</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div key={expense.id} style={styles.expenseCard}>
              <div style={styles.expenseHeader}>
                <div style={styles.expenseInfo}>
                  <div style={styles.expenseAmount}>{formatCurrency(expense.amount)}</div>
                  <div style={styles.expenseMeta}>
                    {expense.vendor && <div style={styles.vendor}>{expense.vendor}</div>}
                    <div style={styles.date}>{formatDate(expense.date)}</div>
                  </div>
                </div>
                <div style={styles.expenseBadges}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: expense.paid_by === 'owner' ? theme.colors.primary : theme.colors.secondary,
                  }}>
                    {expense.paid_by === 'owner' ? 'Owner Paid' : 'Contractor Paid'}
                  </span>
                  <span style={{...styles.badge, backgroundColor: '#6B7280'}}>
                    {getCategoryLabel(expense.category)}
                  </span>
                </div>
              </div>

              {expense.description && (
                <p style={styles.description}>{expense.description}</p>
              )}

              {expense.receipt_photo_url && (
                <div style={styles.receiptContainer}>
                  <img
                    src={expense.receipt_photo_url}
                    alt="Receipt"
                    style={styles.receiptThumbnail}
                    onClick={() => setSelectedImage(expense.receipt_photo_url)}
                  />
                </div>
              )}

              <div style={styles.expenseFooter}>
                <span style={styles.addedBy}>Added by {expense.added_by_name}</span>
                {canAdd && (
                  <div style={styles.actions}>
                    <button
                      style={styles.actionButton}
                      onClick={() => setEditingExpense(expense)}
                    >
                      Edit
                    </button>
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDeleteExpense(expense.id)}
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

      {selectedImage && (
        <div style={styles.imageModal} onClick={() => setSelectedImage(null)}>
          <div style={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeImageButton} onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Receipt full view" style={styles.fullImage} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  loading: {
    textAlign: 'center',
    padding: theme.spacing.xl,
    color: theme.colors.textLight,
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  summaryCard: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  summaryValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: theme.colors.text,
  },
  categoryBreakdown: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
  },
  breakdownTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: theme.spacing.md,
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
  categoryAmount: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: theme.colors.text,
  },
  filters: {
    display: 'flex',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
    whiteSpace: 'nowrap',
  },
  filterButtons: {
    display: 'flex',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    padding: '4px',
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.backgroundDark}`,
  },
  filterButton: {
    padding: '8px 16px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: theme.colors.text,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
  },
  filterSelect: {
    padding: '8px 12px',
    border: `1px solid ${theme.colors.backgroundDark}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '14px',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    cursor: 'pointer',
    fontWeight: '500',
  },
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  expenseCard: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.backgroundLight}`,
    borderRadius: '8px',
    padding: '24px',
    transition: 'box-shadow 0.2s',
  },
  expenseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '16px',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseAmount: {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '8px',
  },
  expenseMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  vendor: {
    fontSize: '16px',
    color: theme.colors.text,
    fontWeight: '500',
  },
  date: {
    fontSize: '14px',
    color: theme.colors.textLight,
  },
  expenseBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'flex-end',
  },
  badge: {
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    color: theme.colors.white,
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: '15px',
    color: theme.colors.text,
    marginBottom: '16px',
    lineHeight: '1.6',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.colors.backgroundLight}`,
  },
  receiptContainer: {
    marginBottom: '16px',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.colors.backgroundLight}`,
  },
  receiptThumbnail: {
    width: '150px',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '6px',
    cursor: 'pointer',
    border: `1px solid ${theme.colors.backgroundLight}`,
  },
  expenseFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: `1px solid ${theme.colors.backgroundLight}`,
    marginTop: '12px',
  },
  addedBy: {
    fontSize: '14px',
    color: theme.colors.textLight,
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  actionButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.white,
    color: theme.colors.error,
    border: `1px solid ${theme.colors.error}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: `${theme.spacing.xl} ${theme.spacing.lg}`,
  },
  emptyText: {
    fontSize: '1.125rem',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  emptyHint: {
    fontSize: '0.95rem',
    color: theme.colors.textLight,
  },
  imageModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: theme.spacing.lg,
  },
  imageModalContent: {
    position: 'relative',
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
  closeImageButton: {
    position: 'absolute',
    top: '-40px',
    right: 0,
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.white,
    fontSize: '2rem',
    cursor: 'pointer',
    padding: theme.spacing.sm,
  },
  fullImage: {
    maxWidth: '100%',
    maxHeight: '90vh',
    objectFit: 'contain',
  },
};

export default ExpensesSection;