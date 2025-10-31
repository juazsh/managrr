import api from './api';

const estimateService = {
  createEstimate: async (estimateData) => {
    const response = await api.post('/estimates', estimateData);
    return response.data;
  },

  getEstimatesByContract: async (contractId) => {
    const response = await api.get(`/estimates/contract/${contractId}`);
    return response.data;
  },

  approveEstimate: async (estimateId, setAsActive = true) => {
    const response = await api.post(`/estimates/${estimateId}/approve`, {
      set_as_active: setAsActive,
    });
    return response.data;
  },

  rejectEstimate: async (estimateId, reason) => {
    const response = await api.post(`/estimates/${estimateId}/reject`, {
      reason,
    });
    return response.data;
  },
};

export default estimateService;
