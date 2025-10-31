import React, { useState, useEffect } from 'react';
import estimateService from '../../services/estimateService';
import AddEstimateModal from './AddEstimateModal';
import EstimateApprovalModal from './EstimateApprovalModal';

const EstimatesSection = ({ contract, userType, onEstimateUpdated }) => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [approvingEstimate, setApprovingEstimate] = useState(null);

  useEffect(() => {
    if (contract?.id) {
      fetchEstimates();
    }
  }, [contract]);

  const fetchEstimates = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await estimateService.getEstimatesByContract(contract.id);
      setEstimates(data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load estimates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEstimate = async (estimateData) => {
    try {
      await estimateService.createEstimate({
        contract_id: contract.id,
        ...estimateData,
      });
      setShowAddModal(false);
      fetchEstimates();
      if (onEstimateUpdated) onEstimateUpdated();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to create estimate');
    }
  };

  const handleApproveEstimate = async (estimateId, setAsActive) => {
    try {
      await estimateService.approveEstimate(estimateId, setAsActive);
      setApprovingEstimate(null);
      fetchEstimates();
      if (onEstimateUpdated) onEstimateUpdated();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to approve estimate');
    }
  };

  const handleRejectEstimate = async (estimateId, reason) => {
    try {
      await estimateService.rejectEstimate(estimateId, reason);
      setApprovingEstimate(null);
      fetchEstimates();
      if (onEstimateUpdated) onEstimateUpdated();
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to reject estimate');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeEstimate = estimates.find(e => e.is_active);
  const isContractor = userType === 'contractor';
  const isOwner = userType === 'house_owner';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Loading estimates...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Estimates</h3>
        {isContractor && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Estimate
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {activeEstimate && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Active Estimate</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(activeEstimate.amount)}</p>
            </div>
            <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
              ACTIVE
            </span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {estimates.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No estimates submitted yet</p>
        ) : (
          estimates.map((estimate) => (
            <div
              key={estimate.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-semibold text-gray-900">{formatCurrency(estimate.amount)}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                      {estimate.status}
                    </span>
                    {estimate.is_active && (
                      <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{estimate.description}</p>
                  <p className="text-xs text-gray-500">Submitted on {formatDate(estimate.submitted_at)}</p>
                  {estimate.status === 'approved' && estimate.approved_at && (
                    <p className="text-xs text-green-600">Approved on {formatDate(estimate.approved_at)}</p>
                  )}
                  {estimate.status === 'rejected' && estimate.rejected_at && (
                    <div className="mt-2">
                      <p className="text-xs text-red-600">Rejected on {formatDate(estimate.rejected_at)}</p>
                      {estimate.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">Reason: {estimate.rejection_reason}</p>
                      )}
                    </div>
                  )}
                </div>
                {isOwner && estimate.status === 'pending' && (
                  <button
                    onClick={() => setApprovingEstimate(estimate)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddEstimateModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEstimate}
        />
      )}

      {approvingEstimate && (
        <EstimateApprovalModal
          estimate={approvingEstimate}
          onClose={() => setApprovingEstimate(null)}
          onApprove={handleApproveEstimate}
          onReject={handleRejectEstimate}
          hasActiveEstimate={!!activeEstimate && activeEstimate.id !== approvingEstimate.id}
        />
      )}
    </div>
  );
};

export default EstimatesSection;
