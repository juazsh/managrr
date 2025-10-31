import React, { useState, useEffect } from 'react';
import paymentService from '../../services/paymentService';
import AddPaymentModal from './AddPaymentModal';
import EditPaymentModal from './EditPaymentModal';
import ImageViewer from '../common/ImageViewer';

export const PaymentSummarySection = ({ projectId, isOwner, isContractor, onPaymentAdded, contractorFilter }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [imageViewerState, setImageViewerState] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [projectId, contractorFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const contractorId = contractorFilter && contractorFilter !== 'all' ? contractorFilter : null;
      const data = await paymentService.getProjectPayments(projectId, contractorId);
      setPayments(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      setError('');
      const contractorId = contractorFilter && contractorFilter !== 'all' ? contractorFilter : null;
      await paymentService.downloadPaymentSummaryExcel(projectId, contractorId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download payment summary');
    } finally {
      setDownloading(false);
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

  const openImageViewer = (payment) => {
    if (!payment.screenshot_url) return;

    setImageViewerState({
      isOpen: true,
      images: [{
        url: payment.screenshot_url,
        caption: `Payment of $${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} via ${getPaymentMethodLabel(payment.payment_method)}`,
        filename: `payment-${payment.id}.jpg`,
      }],
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
      confirmed: { text: '✅ Confirmed', color: '#10B981' },
      disputed: { text: '⚠️ Disputed', color: '#EF4444' },
    };
    return badges[status] || { text: status, color: '#6B7280' };
  };

  if (loading) {
    return <div className="text-center py-12 px-4 text-lg text-text-light">Loading payments...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-text m-0 mb-1">💳 Payment Summary</h2>
          <p className="text-base text-text-light m-0">Track all payments made for this project</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleDownloadExcel}
            className={`px-6 py-3.5 border-2 rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm ${
              downloading
                ? 'bg-background-light text-text-light border-border cursor-not-allowed opacity-60'
                : 'bg-white text-primary border-primary'
            }`}
            disabled={downloading}
          >
            {downloading ? '⏳ Downloading...' : '📥 Download Excel'}
          </button>
          {isOwner && (
            <button onClick={() => setShowAddModal(true)} className="px-6 py-3.5 bg-primary text-white border-0 rounded-md text-base font-semibold cursor-pointer transition-all duration-200 shadow-sm">
              + Add Payment
            </button>
          )}
        </div>
      </div>
      

      {error && <div className="bg-error-light text-error p-4 rounded-md mb-8 border border-error">{error}</div>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        <div className="bg-white p-8 rounded-lg border border-border-light shadow-sm">
          <div className="text-sm text-text-light mb-2 font-semibold">Total Confirmed</div>
          <div className="text-[1.75rem] font-bold text-success">
            ${getTotalPaid().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg border border-border-light shadow-sm">
          <div className="text-sm text-text-light mb-2 font-semibold">Total Pending</div>
          <div className="text-[1.75rem] font-bold text-amber-500">
            ${getTotalPending().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {payments.length === 0 ? (
          <div className="text-center py-12 px-4 bg-background-light rounded-lg border-2 border-dashed border-border">
            <p className="text-lg text-text-light m-0 mb-2">No payments recorded yet</p>
            <p className="text-base text-text-light m-0">
              {isOwner ? 'Add your first payment to start tracking.' : 'Waiting for payment records.'}
            </p>
          </div>
        ) : (
          payments.map((payment) => {
            const badge = getStatusBadge(payment.status);
            return (
              <div key={payment.id} className="bg-white p-8 rounded-lg border border-border-light shadow-sm transition-all duration-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="text-2xl font-bold text-text">
                    ${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="px-3.5 py-1.5 text-white rounded-full text-sm font-semibold" style={{ backgroundColor: badge.color }}>
                    {badge.text}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between py-2 border-b border-border-light">
                    <span className="text-base text-text-light font-semibold">Method</span>
                    <span className="text-base text-text">{getPaymentMethodLabel(payment.payment_method)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border-light">
                    <span className="text-base text-text-light font-semibold">Date</span>
                    <span className="text-base text-text">
                      {new Date(payment.payment_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {payment.notes && (
                  <div className="mt-4 p-4 bg-background-light rounded-md text-base text-text">
                    <strong>Notes:</strong> {payment.notes}
                  </div>
                )}

                {payment.screenshot_url && (
                  <div className="mt-4 mb-4">
                    <div className="relative inline-block">
                      <img
                        src={payment.screenshot_url}
                        alt="Payment proof"
                        className="w-[120px] h-[120px] object-cover rounded-md border-2 border-border-light cursor-pointer transition-all duration-200 block"
                        onClick={() => openImageViewer(payment)}
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 transition-opacity duration-200 hover:opacity-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageViewer(payment);
                          }}
                          className="p-2 bg-black/70 text-white border-0 rounded-md cursor-pointer flex items-center justify-center transition-colors duration-200"
                          title="View image"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            <line x1="11" y1="8" x2="11" y2="14" />
                            <line x1="8" y1="11" x2="14" y2="11" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {payment.status === 'disputed' && payment.dispute_reason && (
                  <div className="mt-4 p-4 bg-error-light rounded-md text-sm text-error border border-error">
                    <strong>Dispute Reason:</strong> {payment.dispute_reason}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-light flex-wrap gap-3">
                  <span className="text-sm text-text-light">Added by {payment.added_by_name}</span>

                  <div className="flex gap-2 flex-wrap">
                    {isContractor && payment.status === 'pending' && (
                      <>
                        <button
                          className="px-4 py-2 bg-success text-white border-0 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200"
                          onClick={() => handleConfirmPayment(payment.id)}
                        >
                          ✓ Received
                        </button>
                        <button
                          className="px-4 py-2 bg-error text-white border-0 rounded-md text-sm font-semibold cursor-pointer transition-all duration-200"
                          onClick={() => handleDisputePayment(payment.id)}
                        >
                          ⚠ Dispute
                        </button>
                      </>
                    )}
                    {isOwner && payment.status === 'pending' && (
                      <>
                        <button
                          className="px-4 py-2 bg-transparent text-primary border-2 border-primary rounded-md text-sm font-semibold cursor-pointer transition-all duration-200"
                          onClick={() => setEditingPayment(payment)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-4 py-2 bg-transparent text-error border-2 border-error rounded-md text-sm font-semibold cursor-pointer transition-all duration-200"
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

export default PaymentSummarySection;
