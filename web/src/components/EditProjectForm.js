import React, { useState } from 'react';
import { theme } from '../theme';

const EditProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    estimated_cost: project.estimated_cost,
    address: project.address,
    status: project.status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.estimated_cost <= 0) {
      setError('Estimated cost must be greater than 0');
      return;
    }

    if (!formData.address.trim()) {
      setError('Address is required');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      background: theme.colors.white,
      padding: '2rem',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      marginBottom: '2rem',
    },
    title: {
      margin: '0 0 1.5rem 0',
      color: theme.colors.text,
      fontSize: theme.typography.h3.fontSize,
      fontWeight: theme.typography.h3.fontWeight,
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: theme.typography.body.fontSize,
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.colors.inputBg,
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.colors.inputBg,
      resize: 'vertical',
      minHeight: '100px',
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      fontSize: theme.typography.body.fontSize,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.colors.inputBg,
    },
    error: {
      backgroundColor: theme.colors.errorLight,
      color: theme.colors.error,
      padding: '0.75rem',
      borderRadius: theme.borderRadius.md,
      marginBottom: '1rem',
      fontSize: theme.typography.small.fontSize,
      border: `1px solid ${theme.colors.error}`,
    },
    actions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '1.5rem',
    },
    cancelButton: {
      padding: '0.75rem 1.5rem',
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius.md,
      cursor: 'pointer',
      fontSize: theme.typography.body.fontSize,
      backgroundColor: theme.colors.white,
      color: theme.colors.text,
      fontWeight: '600',
    },
    saveButton: {
      padding: '0.75rem 1.5rem',
      backgroundColor: theme.colors.black,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      cursor: 'pointer',
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Edit Project</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label htmlFor="title" style={styles.label}>Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            style={styles.textarea}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="estimated_cost" style={styles.label}>Estimated Cost *</label>
          <input
            type="number"
            id="estimated_cost"
            name="estimated_cost"
            value={formData.estimated_cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            disabled={loading}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="address" style={styles.label}>Address *</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={loading}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="status" style={styles.label}>Status *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={loading}
            style={styles.select}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.actions}>
          <button
            type="button"
            onClick={onCancel}
            style={styles.cancelButton}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              ...styles.saveButton,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProjectForm;