import React from 'react';
import { theme } from '../../theme';

const ExpensesSection = ({ projectId, expenses, summary, canAdd, onExpenseAdded }) => {
  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.sectionTitle}>Expenses</h2>
        {canAdd && (
          <button 
            onClick={() => window.alert('Expense creation form coming soon!')}
            style={styles.addButton}
          >
            + Add Expense
          </button>
        )}
      </div>

      {summary && (
        <div style={styles.summaryCards}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryIcon}>💰</div>
            <div>
              <p style={styles.summaryLabel}>Total Spent</p>
              <p style={styles.summaryValue}>
                ${summary.total_spent?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{...styles.summaryIcon, backgroundColor: '#DBEAFE', color: '#1E40AF'}}>
              👤
            </div>
            <div>
              <p style={styles.summaryLabel}>Paid by Owner</p>
              <p style={styles.summaryValue}>
                ${summary.total_by_owner?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          <div style={styles.summaryCard}>
            <div style={{...styles.summaryIcon, backgroundColor: '#FEF3C7', color: '#92400E'}}>
              🔨
            </div>
            <div>
              <p style={styles.summaryLabel}>Paid by Contractor</p>
              <p style={styles.summaryValue}>
                ${summary.total_by_contractor?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>
      )}

      {summary?.by_category && Object.keys(summary.by_category).length > 0 && (
        <div style={styles.categoryBreakdown}>
          <h3 style={styles.breakdownTitle}>Breakdown by Category</h3>
          <div style={styles.categoryGrid}>
            {Object.entries(summary.by_category).map(([category, amount]) => (
              <div key={category} style={styles.categoryCard}>
                <span style={styles.categoryIcon}>
                  {getCategoryIcon(category)}
                </span>
                <div>
                  <p style={styles.categoryName}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </p>
                  <p style={styles.categoryAmount}>
                    ${amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={styles.recentTitle}>Recent Expenses</h3>
      
      {expenses && expenses.length > 0 ? (
        <div style={styles.expensesList}>
          {expenses.map((expense) => (
            <div key={expense.id} style={styles.expenseCard}>
              <div style={styles.expenseHeader}>
                <div>
                  <h4 style={styles.expenseVendor}>
                    {expense.vendor || 'No vendor specified'}
                  </h4>
                  <p style={styles.expenseDate}>
                    {new Date(expense.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div style={styles.expenseAmount}>
                  ${expense.amount.toLocaleString()}
                </div>
              </div>

              <div style={styles.expenseDetails}>
                <div style={styles.expenseTag}>
                  <span style={styles.tagIcon}>{getCategoryIcon(expense.category)}</span>
                  {expense.category}
                </div>
                <div style={{
                  ...styles.expenseTag,
                  backgroundColor: expense.paid_by === 'owner' ? '#DBEAFE' : '#FEF3C7',
                  color: expense.paid_by === 'owner' ? '#1E40AF' : '#92400E',
                }}>
                  Paid by {expense.paid_by}
                </div>
              </div>

              {expense.description && (
                <p style={styles.expenseDescription}>{expense.description}</p>
              )}

              {expense.receipt_photo_url && (
                <div style={styles.receiptPreview}>
                  <img 
                    src={expense.receipt_photo_url} 
                    alt="Receipt" 
                    style={styles.receiptImage}
                  />
                </div>
              )}

              <p style={styles.addedBy}>Added by {expense.added_by_name}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No expenses recorded yet</p>
        </div>
      )}
    </div>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    materials: '🧱',
    labor: '👷',
    equipment: '🔧',
    other: '📦',
  };
  return icons[category] || '📦';
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
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: theme.colors.backgroundLight,
    padding: '1.25rem',
    borderRadius: theme.borderRadius.md,
  },
  summaryIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#D1FAE5',
    color: '#065F46',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  summaryLabel: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    margin: '0 0 0.25rem 0',
  },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
  },
  categoryBreakdown: {
    marginBottom: '2rem',
  },
  breakdownTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  categoryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.border}`,
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
  },
  categoryIcon: {
    fontSize: '1.5rem',
  },
  categoryName: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    margin: '0 0 0.25rem 0',
  },
  categoryAmount: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  recentTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '1rem',
  },
  expensesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  expenseCard: {
    backgroundColor: theme.colors.white,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    padding: '1.25rem',
  },
  expenseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  expenseVendor: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: theme.colors.text,
    margin: '0 0 0.25rem 0',
  },
  expenseDate: {
    fontSize: '0.875rem',
    color: theme.colors.textLight,
    margin: 0,
  },
  expenseAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.colors.primary,
  },
  expenseDetails: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '0.75rem',
  },
  expenseTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#F3F4F6',
    color: theme.colors.text,
    borderRadius: theme.borderRadius.sm,
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  tagIcon: {
    fontSize: '1rem',
  },
  expenseDescription: {
    fontSize: '0.95rem',
    color: theme.colors.text,
    lineHeight: '1.5',
    marginBottom: '0.75rem',
  },
  receiptPreview: {
    marginTop: '0.75rem',
    marginBottom: '0.75rem',
  },
  receiptImage: {
    maxWidth: '200px',
    maxHeight: '200px',
    borderRadius: theme.borderRadius.sm,
    objectFit: 'cover',
    cursor: 'pointer',
  },
  addedBy: {
    fontSize: '0.75rem',
    color: theme.colors.textLight,
    margin: '0.5rem 0 0 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: theme.colors.textLight,
  },
};

export default ExpensesSection;