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

  getProjectDashboard: async (id, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.contractor_id) {
      queryParams.append('contractor_id', params.contractor_id);
    }
    const queryString = queryParams.toString();
    const url = `/projects/${id}/dashboard${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
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

  listContractors: async () => {
    const response = await api.get('/users/contractors');
    return response.data;
  },
  
  assignContractor: async (projectId, contractorIds) => {
    const response = await api.post(`/projects/${projectId}/contractors`, {
      contractor_ids: contractorIds,
    });
    return response.data;
  },

  removeContractor: async (projectId, contractorId) => {
    const response = await api.delete(`/projects/${projectId}/contractors/${contractorId}`);
    return response.data;
  },

  getProjectContractors: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/contractors`);
    return response.data;
  },

  getProjectPhotos: async (id, contractId = null) => {
    const queryParams = new URLSearchParams();
    if (contractId) {
      queryParams.append('contract_id', contractId);
    }
    const queryString = queryParams.toString();
    const url = `/projects/${id}/photos${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return { photos: response.data };
  },

  uploadProjectPhoto: async (id, photoFile, caption, contractId) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    if (caption) {
      formData.append('caption', caption);
    }
    if (contractId) {
      formData.append('contract_id', contractId);
    }

    const response = await api.post(`/projects/${id}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProjectUpdates: async (id, contractId = null) => {
    const queryParams = new URLSearchParams();
    if (contractId) {
      queryParams.append('contract_id', contractId);
    }
    const queryString = queryParams.toString();
    const url = `/projects/${id}/updates${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },

  createProjectUpdate: async (id, updateData) => {
    const formData = new FormData();
    formData.append('update_type', updateData.update_type);
    formData.append('content', updateData.content);

    if (updateData.photos && updateData.photos.length > 0) {
      updateData.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await api.post(`/projects/${id}/updates`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default projectService;