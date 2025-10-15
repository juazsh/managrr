import api from './api';

const projectService = {
  getAllProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getProjectById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  getProjectDashboard: async (id: string) => {
    const response = await api.get(`/projects/${id}/dashboard`);
    return response.data;
  },

  createProject: async (projectData: any) => {
    const formData = new FormData();
    formData.append('title', projectData.title);
    formData.append('description', projectData.description);
    formData.append('estimated_cost', projectData.estimated_cost.toString());
    formData.append('address', projectData.address);

    if (projectData.photos && projectData.photos.length > 0) {
      projectData.photos.forEach((photo: any) => {
        formData.append('photos', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || 'photo.jpg',
        } as any);
      });
    }

    const response = await api.post('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProject: async (id: string, projectData: any) => {
    const payload = {
      ...projectData,
      estimated_cost: parseFloat(projectData.estimated_cost),
    };
    const response = await api.put(`/projects/${id}`, payload);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  assignContractor: async (id: string, contractorEmail: string) => {
    const response = await api.post(`/projects/${id}/assign-contractor`, {
      contractor_email: contractorEmail,
    });
    return response.data;
  },

  getProjectPhotos: async (id: string) => {
    const response = await api.get(`/projects/${id}/photos`);
    return response.data;
  },

  uploadProjectPhoto: async (id: string, photoUri: string, caption?: string) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);
    
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

  getProjectUpdates: async (id: string) => {
    const response = await api.get(`/projects/${id}/updates`);
    return response.data;
  },

  createProjectUpdate: async (id: string, updateData: any) => {
    const formData = new FormData();
    formData.append('update_type', updateData.update_type);
    formData.append('content', updateData.content);

    if (updateData.photos && updateData.photos.length > 0) {
      updateData.photos.forEach((photo: any, index: number) => {
        formData.append('photos[]', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || `photo_${index}.jpg`,
        } as any);
        
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

  getProjectExpenses: async (id: string, filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.paid_by) params.append('paid_by', filters.paid_by);
    if (filters.category) params.append('category', filters.category);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/projects/${id}/expenses?${params.toString()}`);
    return response.data;
  },

  getProjectWorkLogs: async (id: string) => {
    const response = await api.get(`/projects/${id}/work-logs`);
    return response.data;
  },
};

export default projectService;