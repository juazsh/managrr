import React, { useState } from 'react';
import { theme } from '../../theme';

const AddPaymentModal = ({ projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    project_id: projectId,
    amount: '',
    payment_method: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData, screenshotFile);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add Payment</h2>
          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
                Payment Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Payment Method <span style={styles.required}>*</span>
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="cash">💵 Cash</option>
              <option value="bank_transfer">🏦 Bank Transfer</option>
              <option value="zelle">💸 Zelle</option>
              <option value="paypal">💳 PayPal</option>
              <option value="cash_app">💰 Cash App</option>
              <option value="venmo">📱 Venmo</option>
              <option value="other">📋 Other</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="e.g., Deposit for materials, Week 3 labor payment..."
              rows="3"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Screenshot (Optional)</label>
            {!screenshotPreview ? (
              <div style={styles.fileInputWrapper}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={styles.fileInput}
                  id="screenshot"
                />
                <label htmlFor="screenshot" style={styles.fileLabel}>
                  📷 Choose Screenshot
                </label>
              </div>
            ) : (
              <div style={styles.previewContainer}>
                <img src={screenshotPreview} alt="Preview" style={styles.preview} />
                <button type="button" style={styles.removeButton} onClick={handleRemoveFile}>
                  Remove
                </button>
              </div>
            )}
            <p style={styles.fileHint}>JPG, JPEG, or PNG (Max 5MB)</p>
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelButton} onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Adding...' : 'Add Payment'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: theme.shadows.xl,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.component,
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: '700',
    color: theme.colors.text,
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: theme.colors.textLight,
    cursor: 'pointer',
    padding: 0,
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    color: theme.colors.error,
    padding: theme.spacing.element,
    margin: `${theme.spacing.element} ${theme.spacing.component} 0`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    border: `1px solid ${theme.colors.error}`,
  },
  form: {
    padding: theme.spacing.component,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '0.5rem',
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  select: {
    width: '100%',
    padding: '0.875rem',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.colors.white,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  textarea: {
    width: '100%',
    padding: '0.875rem',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontFamily: theme.typography.fontFamily,
    resize: 'vertical',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  fileInputWrapper: {
    marginBottom: '0.5rem',
  },
  fileInput: {
    display: 'none',
  },
  fileLabel: {
    display: 'inline-block',
    padding: '0.875rem 1.5rem',
    backgroundColor: theme.colors.backgroundLight,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  fileHint: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.textLight,
    margin: '0.5rem 0 0 0',
  },
  previewContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  preview: {
    width: '120px',
    height: '120px',
    objectFit: 'cover',
    borderRadius: theme.borderRadius.md,
    border: `2px solid ${theme.colors.border}`,
  },
  removeButton: {
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
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: theme.spacing.component,
    flexWrap: 'wrap',
  },
  cancelButton: {
    padding: '0.875rem 1.75rem',
    backgroundColor: theme.colors.white,
    color: theme.colors.text,
    border: `2px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '0.875rem 1.75rem',
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
};

export default AddPaymentModal;