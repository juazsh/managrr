import api from './api';

const projectService = {
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return { projects: response.data };
  },

  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return { project: response.data };
  },

  getProjectDashboard: async (id) => {
    const response = await api.get(`/projects/${id}/dashboard`);
    return response.data;
  },

  createProject: async (projectData) => {
    const formData = new FormData();
    formData.append('title', projectData.title);
    formData.append('description', projectData.description);
    formData.append('estimated_cost', projectData.estimated_cost);
    formData.append('address', projectData.address);

    if (projectData.photos && projectData.photos.length > 0) {
      projectData.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const payload = {
      ...projectData,
      estimated_cost: parseFloat(projectData.estimated_cost)
    };
    const response = await api.put(`/projects/${id}`, payload);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  assignContractor: async (id, contractorEmail) => {
    const response = await api.post(`/projects/${id}/assign-contractor`, {
      contractor_email: contractorEmail,
    });
    return response.data;
  },

  getProjectPhotos: async (id) => {
    const response = await api.get(`/projects/${id}/photos`);
    return { photos: response.data };
  },

  uploadProjectPhoto: async (id, photoFile, caption) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await api.post(`/projects/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProjectUpdates: async (id) => {
    const response = await api.get(`/projects/${id}/updates`);
    return response.data;
  },

  createProjectUpdate: async (id, updateData) => {
    const formData = new FormData();
    formData.append('update_type', updateData.update_type);
    formData.append('content', updateData.content);
  
    if (updateData.photos && updateData.photos.length > 0) {
      updateData.photos.forEach((photo, index) => {
        formData.append('photos[]', photo.file);  // Changed from 'photos' to 'photos[]'
        if (photo.caption) {
          formData.append(`captions[${index}]`, photo.caption);
        }
      });
    }
  
    const response = await api.post(`/projects/${id}/updates`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProjectExpenses: async (id, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.paid_by) params.append('paid_by', filters.paid_by);
    if (filters.category) params.append('category', filters.category);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/projects/${id}/expenses?${params.toString()}`);
    return response.data;
  },

  getProjectWorkLogs: async (id) => {
    const response = await api.get(`/projects/${id}/work-logs`);
    return response.data;
  },
};

export default projectService;