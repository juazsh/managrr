import React, { useState } from 'react';
import contractService from '../../services/contractService';

const ContractInfoSection = ({ contract, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this contract?`)) {
      return;
    }

    try {
      setUpdating(true);
      setError('');
      const statusData = { status: newStatus };
      if (newStatus === 'completed' || newStatus === 'terminated') {
        statusData.end_date = new Date().toISOString();
      }
      await contractService.updateContractStatus(contract.id, statusData);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update contract status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Contract Information</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
          {contract.status}
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Contractor</p>
          <p className="text-base font-medium text-gray-900">{contract.contractor_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="text-base text-gray-900">{formatDate(contract.start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="text-base text-gray-900">{formatDate(contract.end_date)}</p>
          </div>
        </div>

        {contract.terms && (
          <div>
            <p className="text-sm text-gray-500">Terms</p>
            <p className="text-base text-gray-900">{contract.terms}</p>
          </div>
        )}

        {contract.status === 'active' && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
            <button
              onClick={() => handleStatusUpdate('completed')}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? 'Updating...' : 'Mark as Completed'}
            </button>
            <button
              onClick={() => handleStatusUpdate('terminated')}
              disabled={updating}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? 'Updating...' : 'Terminate Contract'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractInfoSection;
