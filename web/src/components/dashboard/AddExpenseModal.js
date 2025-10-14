import React, { useState } from 'react';
import { theme } from '../../theme';

const AddExpenseModal = ({ projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
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

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        ...formData,
        project_id: projectId,
        amount: parseFloat(formData.amount),
      };
      await onSubmit(expenseData, receiptFile);
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
          <button style={styles.closeButton} onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={styles.error}>{error}</div>}

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
                  step="0.01"
                  min="0"
                  style={styles.input}
                  placeholder="0.00"
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date <span style={styles.required}>*</span></label>
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
              <label style={styles.label}>Vendor/Store</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                style={styles.input}
                placeholder="Home Depot, Lowe's, etc."
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
            <button type="button" style={styles.cancelButton} onClick={onClose}>
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
  },
  modal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: '90%',
    maxWidth: '540px',
    maxHeight: '90vh',
    overflow: 'hidden',
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
  },
  formBody: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '8px',
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${theme.colors.backgroundDark}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: theme.colors.text,
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${theme.colors.backgroundDark}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${theme.colors.backgroundDark}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: theme.colors.text,
    resize: 'vertical',
    minHeight: '80px',
    boxSizing: 'border-box',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: theme.colors.white,
    border: `2px dashed ${theme.colors.backgroundDark}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.colors.text,
  },
  fileLabelIcon: {
    fontSize: '18px',
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
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  preview: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '6px',
    border: `1px solid ${theme.colors.backgroundLight}`,
    backgroundColor: theme.colors.backgroundLight,
  },
  removeButton: {
    alignSelf: 'flex-start',
    padding: '6px 16px',
    backgroundColor: 'transparent',
    color: theme.colors.error,
    border: `1px solid ${theme.colors.error}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: `1px solid ${theme.colors.backgroundLight}`,
  },
  cancelButton: {
    padding: '10px 24px',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `1px solid ${theme.colors.backgroundDark}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 24px',
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default AddExpenseModal;