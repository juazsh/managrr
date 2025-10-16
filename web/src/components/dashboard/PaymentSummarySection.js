import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';
import paymentService from '../../services/paymentService';
import AddPaymentModal from './AddPaymentModal';
import EditPaymentModal from './EditPaymentModal';

export const PaymentSummarySection = ({ projectId, isOwner, isContractor, onPaymentAdded }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, [projectId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await paymentService.getProjectPayments(projectId);
      setPayments(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (paymentData, screenshotFile) => {
    try {
      await paymentService.addPayment(paymentData, screenshotFile);
      setShowAddModal(false);
      fetchPayments();
      if (onPaymentAdded) onPaymentAdded();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to add payment');
    }
  };

  const handleEditPayment = async (paymentId, paymentData, screenshotFile) => {
    try {
      await paymentService.updatePayment(paymentId, paymentData, screenshotFile);
      setEditingPayment(null);
      fetchPayments();
      if (onPaymentAdded) onPaymentAdded();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update payment');
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    if (!window.confirm('Confirm that you have received this payment?')) return;
    
    try {
      await paymentService.confirmPayment(paymentId);
      fetchPayments();
      if (onPaymentAdded) onPaymentAdded();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm payment');
    }
  };

  const handleDisputePayment = async (paymentId) => {
    const reason = window.prompt('Please provide a reason for disputing this payment:');
    if (!reason || !reason.trim()) return;
    
    try {
      await paymentService.disputePayment(paymentId, reason);
      fetchPayments();
      if (onPaymentAdded) onPaymentAdded();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to dispute payment');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await paymentService.deletePayment(paymentId);
      fetchPayments();
      if (onPaymentAdded) onPaymentAdded();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete payment');
    }
  };

  const getTotalPaid = () => {
    return payments
      .filter(p => p.status === 'confirmed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const getTotalPending = () => {
    return payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: '💵 Cash',
      bank_transfer: '🏦 Bank Transfer',
      zelle: '💸 Zelle',
      paypal: '💳 PayPal',
      cash_app: '💰 Cash App',
      venmo: '📱 Venmo',
      other: '📋 Other',
    };
    return labels[method] || method;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: '⏳ Pending', color: '#F59E0B' },
      confirmed: { text: '✅ Confirmed', color: theme.colors.success },
      disputed: { text: '⚠️ Disputed', color: theme.colors.error },
    };
    return badges[status] || { text: status, color: '#6B7280' };
  };

  if (loading) {
    return <div style={styles.loading}>Loading payments...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>💳 Payment Summary</h2>
          <p style={styles.subtitle}>Track all payments made for this project</p>
        </div>
        {isOwner && (
          <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
            + Add Payment
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.summaryCards}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Confirmed</div>
          <div style={styles.summaryAmount}>
            ${getTotalPaid().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Pending</div>
          <div style={{ ...styles.summaryAmount, color: '#F59E0B' }}>
            ${getTotalPending().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div style={styles.paymentsGrid}>
        {payments.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No payments recorded yet</p>
            {isOwner && (
              <p style={styles.emptySubtext}>Click "Add Payment" to record a payment</p>
            )}
          </div>
        ) : (
          payments.map((payment) => {
            const statusBadge = getStatusBadge(payment.status);
            return (
              <div key={payment.id} style={styles.paymentCard}>
                <div style={styles.paymentHeader}>
                  <div style={styles.paymentAmount}>
                    ${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span style={{ ...styles.statusBadge, backgroundColor: statusBadge.color }}>
                    {statusBadge.text}
                  </span>
                </div>

                <div style={styles.paymentDetails}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Method:</span>
                    <span style={styles.detailValue}>{getPaymentMethodLabel(payment.payment_method)}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Date:</span>
                    <span style={styles.detailValue}>
                      {new Date(payment.payment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  {payment.notes && (
                    <div style={styles.notes}>
                      <strong>Note:</strong> {payment.notes}
                    </div>
                  )}
                </div>

                {payment.screenshot_url && (
                  <div style={styles.screenshotContainer}>
                    <img
                      src={payment.screenshot_url}
                      alt="Payment proof"
                      style={styles.screenshotThumbnail}
                      onClick={() => setSelectedImage(payment.screenshot_url)}
                    />
                  </div>
                )}

                {payment.status === 'disputed' && payment.dispute_reason && (
                  <div style={styles.disputeReason}>
                    <strong>Dispute Reason:</strong> {payment.dispute_reason}
                  </div>
                )}

                <div style={styles.paymentFooter}>
                  <span style={styles.addedBy}>Added by {payment.added_by_name}</span>
                  
                  <div style={styles.actions}>
                    {isContractor && payment.status === 'pending' && (
                      <>
                        <button
                          style={styles.confirmButton}
                          onClick={() => handleConfirmPayment(payment.id)}
                        >
                          ✓ Received
                        </button>
                        <button
                          style={styles.disputeButton}
                          onClick={() => handleDisputePayment(payment.id)}
                        >
                          ⚠ Dispute
                        </button>
                      </>
                    )}
                    {isOwner && payment.status === 'pending' && (
                      <>
                        <button
                          style={styles.editButton}
                          onClick={() => setEditingPayment(payment)}
                        >
                          Edit
                        </button>
                        <button
                          style={styles.deleteButton}
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <AddPaymentModal
          projectId={projectId}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPayment}
        />
      )}

      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSubmit={handleEditPayment}
        />
      )}

      {selectedImage && (
        <div style={styles.imageModal} onClick={() => setSelectedImage(null)}>
          <div style={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setSelectedImage(null)}>
              ×
            </button>
            <img src={selectedImage} alt="Payment proof" style={styles.fullImage} />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: theme.spacing.component,
  },
  loading: {
    textAlign: 'center',
    padding: '3rem 1rem',
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.textLight,
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: theme.spacing.element,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.component,
    border: `1px solid ${theme.colors.error}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.component,
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    margin: '0 0 0.25rem 0',
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textLight,
    margin: 0,
  },
  addButton: {
    padding: '0.875rem 1.5rem',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: theme.shadows.sm,
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.element,
    marginBottom: theme.spacing.component,
  },
  summaryCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.component,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: theme.shadows.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  summaryAmount: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: theme.colors.success,
  },
  paymentsGrid: {
    display: 'grid',
    gap: theme.spacing.element,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    border: `2px dashed ${theme.colors.border}`,
  },
  emptyText: {
    fontSize: theme.typography.bodyLarge.fontSize,
    color: theme.colors.textLight,
    margin: '0 0 0.5rem 0',
  },
  emptySubtext: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textLight,
    margin: 0,
  },
  paymentCard: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.component,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
    boxShadow: theme.shadows.sm,
    transition: 'all 0.2s ease',
  },
  paymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.element,
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  paymentAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: theme.colors.text,
  },
  statusBadge: {
    padding: '0.375rem 0.875rem',
    color: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
  },
  paymentDetails: {
    marginBottom: theme.spacing.element,
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  detailLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  notes: {
    marginTop: theme.spacing.element,
    padding: theme.spacing.element,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  screenshotContainer: {
    marginTop: theme.spacing.element,
    marginBottom: theme.spacing.element,
  },
  screenshotThumbnail: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${theme.colors.borderLight}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  disputeReason: {
    marginTop: theme.spacing.element,
    padding: theme.spacing.element,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.error,
    border: `1px solid ${theme.colors.error}`,
  },
  paymentFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.element,
    paddingTop: theme.spacing.element,
    borderTop: `1px solid ${theme.colors.borderLight}`,
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  addedBy: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  confirmButton: {
    padding: '0.5rem 1rem',
    backgroundColor: theme.colors.success,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  disputeButton: {
    padding: '0.5rem 1rem',
    backgroundColor: theme.colors.error,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: theme.colors.primary,
    border: `2px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: theme.colors.error,
    border: `2px solid ${theme.colors.error}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.small.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  imageModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  imageModalContent: {
    position: 'relative',
    maxWidth: '90%',
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: '-3rem',
    right: 0,
    background: 'none',
    border: 'none',
    fontSize: '3rem',
    color: theme.colors.white,
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
  },
  fullImage: {
    maxWidth: '100%',
    maxHeight: '85vh',
    objectFit: 'contain',
    borderRadius: theme.borderRadius.lg,
  },
};

export default PaymentSummarySection;