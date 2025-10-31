import React from 'react';

const ContractSelector = ({ contracts, selectedContract, onSelectContract, className = '' }) => {
  if (!contracts || contracts.length === 0) {
    return null;
  }

  if (contracts.length === 1) {
    const contract = contracts[0];
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Contract with</p>
            <p className="text-lg font-semibold text-gray-900">{contract.contractor_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            contract.status === 'active' ? 'bg-green-100 text-green-800' :
            contract.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            contract.status === 'terminated' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {contract.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Contract
      </label>
      <select
        value={selectedContract || 'all'}
        onChange={(e) => onSelectContract(e.target.value === 'all' ? null : e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="all">All Contracts</option>
        {contracts.map((contract) => (
          <option key={contract.id} value={contract.id}>
            {contract.contractor_name} - {contract.status}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ContractSelector;
