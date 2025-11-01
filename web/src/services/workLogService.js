import api from './api';

const workLogService = {
  getWorkLogs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();

      if (filters.projectId) {
        params.append('project_id', filters.projectId);
      }
      if (filters.employeeId) {
        params.append('employee_id', filters.employeeId);
      }
      if (filters.startDate) {
        params.append('start_date', filters.startDate);
      }
      if (filters.endDate) {
        params.append('end_date', filters.endDate);
      }

      const response = await api.get(`/work-logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getProjectWorkLogs: async (projectId, contractId = null) => {
    try {
      const params = new URLSearchParams();
      if (contractId) params.append('contract_id', contractId);

      const queryString = params.toString();
      const url = `/projects/${projectId}/work-logs${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWorkLogById: async (id) => {
    try {
      const response = await api.get(`/work-logs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getWeeklySummary: async () => {
    try {
      const response = await api.get('/work-logs/summary/weekly');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSummaryByEmployee: async () => {
    try {
      const response = await api.get('/work-logs/summary/by-employee');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSummaryByProject: async () => {
    try {
      const response = await api.get('/work-logs/summary/by-project');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default workLogService;