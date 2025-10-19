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

  const openImageViewer = (receiptUrl, expenseId) => {
    const images = [{
      url: receiptUrl,
      caption: '',
      filename: `receipt-${expenseId}.jpg`,
    }];

    setImageViewerState({
      isOpen: true,
      images,
      initialIndex: 0,
    });
  };

  const closeImageViewer = () => {
    setImageViewerState({
      isOpen: false,
      images: [],
      initialIndex: 0,
    });
  };

  const handleDownloadImage = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `managrr-receipt-${Date.now()}.jpg`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download receipt. Please try again.');
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
        {canAdd && (
          <button onClick={() => setShowAddModal(true)} style={styles.addButton}>
            + Add Expense
          </button>
        )}
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
            <p style={styles.emptyText}>No expenses found</p>
            {canAdd && (
              <p style={styles.emptyHint}>Add your first expense to track project costs!</p>
            )}
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} style={styles.expenseCard}>
              <div style={styles.expenseHeader}>
                <div style={styles.expenseInfo}>
                  <h4 style={styles.expenseAmount}>${parseFloat(expense.amount).toFixed(2)}</h4>
                  {expense.vendor && <p style={styles.vendor}>{expense.vendor}</p>}
                  <p style={styles.date}>
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div style={styles.badges}>
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
                    src={expense.receipt_photo_url}
                    alt="Receipt"
                    style={styles.receiptThumbnail}
                    onClick={() => openImageViewer(expense.receipt_photo_url, expense.id)}
                  />
                  <div style={styles.imageOverlay} data-overlay>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageViewer(expense.receipt_photo_url, expense.id);
                      }}
                      style={styles.overlayButton}
                      title="View full size"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadImage(expense.receipt_photo_url, `receipt-${expense.id}.jpg`);
                      }}
                      style={styles.overlayButton}
                      title="Download receipt"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </div>
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

      {imageViewerState.isOpen && (
        <ImageViewer
          images={imageViewerState.images}
          initialIndex={imageViewerState.initialIndex}
          onClose={closeImageViewer}
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
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    margin: 0,
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorMessage: {
    padding: '1rem',
    backgroundColor: '#FEE',
    color: '#C33',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1rem',
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: theme.typography.h4.fontWeight,
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
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: theme.colors.text,
  },
  filterSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
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
    color: theme.colors.white,
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