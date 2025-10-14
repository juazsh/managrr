import api from './api';

const expenseService = {
  getProjectExpenses: async (projectId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.paidBy) params.append('paid_by', filters.paidBy);
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);

    const queryString = params.toString();
    const url = `/projects/${projectId}/expenses${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  addExpense: async (expenseData, receiptFile = null) => {
    const formData = new FormData();
    formData.append('project_id', expenseData.project_id);
    formData.append('amount', expenseData.amount);
    formData.append('date', expenseData.date);
    formData.append('category', expenseData.category);
    formData.append('paid_by', expenseData.paid_by);
    
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
    formData.append('paid_by', expenseData.paid_by);
    
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