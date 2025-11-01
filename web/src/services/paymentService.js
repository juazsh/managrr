import api from './api';

const paymentService = {
  getProjectPayments: async (projectId, contractId = null) => {
    const params = new URLSearchParams();
    if (contractId) params.append('contract_id', contractId);

    const queryString = params.toString();
    const url = `/projects/${projectId}/payments${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data;
  },

  downloadPaymentSummaryExcel: async (projectId, contractId = null) => {
    const params = new URLSearchParams();
    if (contractId) params.append('contract_id', contractId);

    const queryString = params.toString();
    const url = `/projects/${projectId}/payment-summaries/download${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = 'payment-summary.xlsx';
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

  addPayment: async (paymentData, screenshotFile) => {
    const formData = new FormData();
    formData.append('project_id', paymentData.project_id);
    formData.append('amount', paymentData.amount);
    formData.append('payment_method', paymentData.payment_method);
    formData.append('payment_date', paymentData.payment_date);

    if (paymentData.contract_id) {
      formData.append('contract_id', paymentData.contract_id);
    }

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