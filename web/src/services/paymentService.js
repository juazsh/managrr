import api from './api';

const paymentService = {
  getProjectPayments: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/payments`);
    return response.data;
  },

  addPayment: async (paymentData, screenshotFile) => {
    const formData = new FormData();
    formData.append('project_id', paymentData.project_id);
    formData.append('amount', paymentData.amount);
    formData.append('payment_method', paymentData.payment_method);
    formData.append('payment_date', paymentData.payment_date);
    
    if (paymentData.notes) {
      formData.append('notes', paymentData.notes);
    }
    
    if (screenshotFile) {
      formData.append('screenshot', screenshotFile);
    }

    const response = await api.post(`/projects/${paymentData.project_id}/payments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePayment: async (paymentId, paymentData, screenshotFile) => {
    const formData = new FormData();
    formData.append('amount', paymentData.amount);
    formData.append('payment_method', paymentData.payment_method);
    formData.append('payment_date', paymentData.payment_date);
    
    if (paymentData.notes) {
      formData.append('notes', paymentData.notes);
    }
    
    if (screenshotFile) {
      formData.append('screenshot', screenshotFile);
    }

    const response = await api.put(`/payments/${paymentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePayment: async (paymentId) => {
    const response = await api.delete(`/payments/${paymentId}`);
    return response.data;
  },

  confirmPayment: async (paymentId) => {
    const response = await api.post(`/payments/${paymentId}/confirm`);
    return response.data;
  },

  disputePayment: async (paymentId, reason) => {
    const response = await api.post(`/payments/${paymentId}/dispute`, { reason });
    return response.data;
  },
};

export default paymentService;