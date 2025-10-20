import React, { useState } from 'react';
import { theme } from '../../theme';
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
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Expenses</h2>
        <div style={styles.headerButtons}>
          <button 
            onClick={handleDownloadExcel} 
            style={downloading ? styles.downloadButtonDisabled : styles.downloadButton}
            disabled={downloading}
          >
            {downloading ? '⏳ Downloading...' : '📥 Download Excel'}
          </button>
          {canAdd && (
            <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
              + Add Expense
            </button>
          )}
        </div>
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.summaryCard}>
        <h3 style={styles.summaryTitle}>Expense Summary</h3>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Spent</span>
            <span style={styles.summaryValue}>${summary.total_spent?.toFixed(2) || '0.00'}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Owner Paid</span>
            <span style={{...styles.summaryValue, color: theme.colors.primary}}>
              ${summary.total_by_owner?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Contractor Paid</span>
            <span style={{...styles.summaryValue, color: theme.colors.secondary}}>
              ${summary.total_by_contractor?.toFixed(2) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.filterSection}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Paid By</label>
          <select
            value={paidByFilter}
            onChange={(e) => setPaidByFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="owner">Owner</option>
            <option value="contractor">Contractor</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="materials">🔨 Materials</option>
            <option value="labor">👷 Labor</option>
            <option value="equipment">🛠️ Equipment</option>
            <option value="other">📦 Other</option>
          </select>
        </div>

        <button onClick={handleApplyFilters} style={styles.applyFilterButton}>
          Apply Filters
        </button>
      </div>

      <div style={styles.expensesList}>
        {loading ? (
          <div style={styles.loadingText}>Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyText}>No expenses found</div>
            {canAdd && (
              <div style={styles.emptyHint}>Click "Add Expense" to record your first expense</div>
            )}
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} style={styles.expenseCard}>
              <div style={styles.expenseHeader}>
                <div style={styles.expenseInfo}>
                  <h3 style={styles.expenseAmount}>${expense.amount.toFixed(2)}</h3>
                  <p style={styles.vendor}>{expense.vendor}</p>
                  <p style={styles.date}>
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div style={styles.badges}>
                  <span style={{...styles.badge, backgroundColor: theme.colors.background}}>
                    {getCategoryLabel(expense.category)}
                  </span>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: expense.paid_by === 'owner' ? theme.colors.primary : theme.colors.secondary,
                      color: theme.colors.white,
                    }}
                  >
                    {expense.paid_by === 'owner' ? '👤 Owner' : '🔧 Contractor'}
                  </span>
                </div>
              </div>

              {expense.description && <p style={styles.description}>{expense.description}</p>}

              {expense.receipt_url && (
                <div 
                  style={styles.receiptContainer}
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
                    style={styles.receiptThumbnail}
                  />
                  <div data-overlay style={styles.imageOverlay}>
                    <button
                      style={styles.overlayButton}
                      onClick={() => setImageViewerState({
                        isOpen: true,
                        images: [{ url: expense.receipt_url, caption: `Receipt - ${expense.vendor}` }],
                        initialIndex: 0,
                      })}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      🔍
                    </button>
                  </div>
                </div>
              )}

              <div style={styles.expenseFooter}>
                <span style={styles.addedBy}>Added by {expense.added_by_name}</span>
                {canAdd && (
                  <div style={styles.actions}>
                    <button
                      onClick={() => setEditingExpense(expense)}
                      style={styles.actionButton}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = theme.colors.primary;
                        e.target.style.color = theme.colors.white;
                        e.target.style.borderColor = theme.colors.primary;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = theme.colors.background;
                        e.target.style.color = theme.colors.text;
                        e.target.style.borderColor = theme.colors.border;
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      style={styles.deleteButton}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#C33';
                        e.target.style.color = theme.colors.white;
                        e.target.style.borderColor = '#C33';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#FEE';
                        e.target.style.color = '#C33';
                        e.target.style.borderColor = '#FCC';
                      }}
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

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  headerButtons: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  downloadButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: theme.colors.white,
    color: theme.colors.primary,
    border: `1px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  downloadButtonDisabled: {
    padding: '0.625rem 1.25rem',
    backgroundColor: theme.colors.background,
    color: theme.colors.textLight,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  errorMessage: {
    backgroundColor: '#FEE',
    color: '#C33',
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1rem',
    border: '1px solid #FCC',
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  summaryLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1.25rem',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    flexWrap: 'wrap',
    boxShadow: theme.shadows.sm,
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: '1',
    minWidth: '200px',
  },
  filterLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: theme.colors.text,
  },
  filterSelect: {
    padding: '0.5rem',
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.border}`,
    fontSize: theme.typography.body.fontSize,
    backgroundColor: theme.colors.white,
  },
  applyFilterButton: {
    alignSelf: 'flex-end',
    padding: '0.5rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  expensesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  loadingText: {
    textAlign: 'center',
    padding: '2rem',
    color: theme.colors.textLight,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
  },
  emptyText: {
    fontSize: '1.125rem',
    color: theme.colors.textLight,
    marginBottom: '0.5rem',
  },
  emptyHint: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
  expenseCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    boxShadow: theme.shadows.sm,
    transition: 'all 0.2s',
  },
  expenseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '1rem',
  },
  expenseInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  expenseAmount: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  vendor: {
    fontSize: '1rem',
    color: theme.colors.text,
    margin: 0,
  },
  date: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    margin: 0,
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: theme.borderRadius.full,
    fontSize: '0.75rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  receiptContainer: {
    position: 'relative',
    marginBottom: '1rem',
    display: 'inline-block',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  receiptThumbnail: {
    maxWidth: '300px',
    width: '100%',
    height: 'auto',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'block',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  overlayButton: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: theme.borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: theme.colors.text,
  },
  expenseFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: `1px solid ${theme.colors.border}`,
  },
  addedBy: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#FEE',
    color: '#C33',
    border: '1px solid #FCC',
    borderRadius: theme.borderRadius.md,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default ExpensesSection;