import React, { useState, useEffect } from 'react';
import { theme } from '../../theme';

const AddExpenseModal = ({ projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    project_id: projectId,
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    category: 'materials',
    description: '',
    paid_by: 'owner',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, receiptFile);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add Expense</h2>
          <button style={styles.closeButton} onClick={onClose} type="button">
            ×
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formBody}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Amount <span style={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Vendor/Store <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., Home Depot, Contractor Name..."
                required
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category <span style={styles.required}>*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="materials">🔨 Materials</option>
                  <option value="labor">👷 Labor</option>
                  <option value="equipment">🛠️ Equipment</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Paid By <span style={styles.required}>*</span>
                </label>
                <select
                  name="paid_by"
                  value={formData.paid_by}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="owner">Owner</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                style={styles.textarea}
                placeholder="Add notes about this expense..."
                rows="3"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Receipt Photo (Optional)</label>
              {!receiptPreview ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={styles.fileInput}
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" style={styles.fileLabel}>
                    <span style={styles.fileLabelIcon}>📷</span>
                    <span style={styles.fileLabelText}>Choose File</span>
                  </label>
                  <div style={styles.fileHint}>Max size: 5MB</div>
                </div>
              ) : (
                <div style={styles.previewContainer}>
                  <img src={receiptPreview} alt="Receipt preview" style={styles.preview} />
                  <button type="button" style={styles.removeButton} onClick={handleRemoveFile}>
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" style={styles.cancelButton} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: '540px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: `1px solid ${theme.colors.backgroundLight}`,
    flexShrink: 0,
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '28px',
    color: theme.colors.textLight,
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
    padding: '12px 16px',
    margin: '0 24px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    flexShrink: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    flex: 1,
  },
  formBody: {
    padding: '24px',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    flex: 1,
    minHeight: 0,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: theme.typography.fontFamily,
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.white,
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: theme.typography.fontFamily,
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: theme.colors.backgroundLight,
    border: `2px dashed ${theme.colors.border}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.colors.text,
  },
  fileLabelIcon: {
    fontSize: '20px',
  },
  fileLabelText: {
    fontSize: '14px',
  },
  fileHint: {
    marginTop: '8px',
    fontSize: '12px',
    color: theme.colors.textLight,
  },
  previewContainer: {
    marginTop: '8px',
  },
  preview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  removeButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.colors.backgroundLight}`,
    flexShrink: 0,
  },
  cancelButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '12px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default AddExpenseModal;