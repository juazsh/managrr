import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import { theme } from '../theme';

const CreateProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimated_cost: '',
    address: '',
  });
  const [photos, setPhotos] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Project title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Project description is required');
      return;
    }

    if (!formData.estimated_cost || parseFloat(formData.estimated_cost) <= 0) {
      setError('Please enter a valid estimated cost');
      return;
    }

    if (!formData.address.trim()) {
      setError('Project address is required');
      return;
    }

    try {
      setLoading(true);
      const projectData = {
        ...formData,
        photos,
      };

      const response = await projectService.createProject(projectData);
      navigate(`/projects/${response.project.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h1 style={styles.title}>Create New Project</h1>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Project Title <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Kitchen Renovation"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description <span style={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the project scope and requirements..."
              style={styles.textarea}
              rows="5"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Estimated Cost <span style={styles.required}>*</span>
            </label>
            <div style={styles.inputWithPrefix}>
              <span style={styles.prefix}>$</span>
              <input
                type="number"
                name="estimated_cost"
                value={formData.estimated_cost}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                style={styles.inputWithPrefixField}
                required
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Address <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="123 Main St, City, State ZIP"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Project Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
              style={styles.fileInput}
            />
            {photos.length > 0 && (
              <p style={styles.fileCount}>{photos.length} file(s) selected</p>
            )}
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" style={styles.submitButton} disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
  },
  formCard: {
    backgroundColor: theme.colors.white,
    padding: '2rem',
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadows.md,
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '1.5rem',
  },
  error: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: theme.borderRadius.md,
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '0.5rem',
  },
  required: {
    color: '#DC2626',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: `1px solid ${theme.colors.backgroundLight}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: `1px solid ${theme.colors.backgroundLight}`,
    borderRadius: theme.borderRadius.md,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  inputWithPrefix: {
    display: 'flex',
    alignItems: 'center',
    border: `1px solid ${theme.colors.backgroundLight}`,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  prefix: {
    padding: '0.75rem',
    backgroundColor: theme.colors.backgroundLight,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  inputWithPrefixField: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    border: 'none',
    outline: 'none',
  },
  fileInput: {
    padding: '0.5rem',
    fontSize: '0.95rem',
    border: `1px solid ${theme.colors.backgroundLight}`,
    borderRadius: theme.borderRadius.md,
  },
  fileCount: {
    marginTop: '0.5rem',
    fontSize: '0.875rem',
    color: theme.colors.textLight,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  cancelButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: theme.colors.white,
    color: theme.colors.textLight,
    border: `1px solid ${theme.colors.backgroundLight}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
  },
  submitButton: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
  },
};

export default CreateProject;