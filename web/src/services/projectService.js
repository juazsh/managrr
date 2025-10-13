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
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;