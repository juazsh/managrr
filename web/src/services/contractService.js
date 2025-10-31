import api from './api';

const contractService = {
  getContractsByProject: async (projectId) => {
    const response = await api.get(`/contracts/project/${projectId}`);
    return response.data;
  },

  getContract: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  },

  updateContractStatus: async (contractId, statusData) => {
    const response = await api.put(`/contracts/${contractId}/status`, statusData);
    return response.data;
  },
};

export default contractService;
