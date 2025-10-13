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
};

export default projectService;