import api from './api';

const expenseService = {
  getProjectExpenses: async (projectId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.paidBy) params.append('paid_by', filters.paidBy);
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.contractId) params.append('contract_id', filters.contractId);

    const queryString = params.toString();
    const url = `/projects/${projectId}/expenses${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  downloadExpensesExcel: async (projectId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.paidBy && filters.paidBy !== 'all') params.append('paid_by', filters.paidBy);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.contractId) params.append('contract_id', filters.contractId);

    const queryString = params.toString();
    const url = `/projects/${projectId}/expenses/download${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = 'expenses.xlsx';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  addExpense: async (expenseData, receiptFile = null) => {
    const formData = new FormData();
    formData.append('project_id', expenseData.project_id);
    formData.append('amount', expenseData.amount);
    formData.append('date', expenseData.date);
    formData.append('category', expenseData.category);

    if (expenseData.contract_id) formData.append('contract_id', expenseData.contract_id);
    if (expenseData.vendor) formData.append('vendor', expenseData.vendor);
    if (expenseData.description) formData.append('description', expenseData.description);
    if (receiptFile) formData.append('receipt_photo', receiptFile);

    const response = await api.post('/expenses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getExpenseById: async (expenseId) => {
    const response = await api.get(`/expenses/${expenseId}`);
    return response.data;
  },

  updateExpense: async (expenseId, expenseData, receiptFile = null) => {
    const formData = new FormData();
    formData.append('amount', expenseData.amount);
    formData.append('date', expenseData.date);
    formData.append('category', expenseData.category);

    if (expenseData.vendor) formData.append('vendor', expenseData.vendor);
    if (expenseData.description) formData.append('description', expenseData.description);
    if (receiptFile) formData.append('receipt_photo', receiptFile);

    const response = await api.put(`/expenses/${expenseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    const response = await api.delete(`/expenses/${expenseId}`);
    return response.data;
  },
};

export default expenseService;