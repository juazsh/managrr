import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import  contractService  from '../../services/contractService';

const AddExpenseModal = ({ projectId, onClose, onSubmit }) => {
  const { user } = useAuth();
  const isOwner = user?.user_type === 'house_owner';

  const [formData, setFormData] = useState({
    project_id: projectId,
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    category: 'materials',
    description: '',
    contract_id: '',
  });
  const [contracts, setContracts] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchContracts = async () => {
      if (isOwner && projectId) {
        setLoadingContracts(true);
        try {
          const data = await contractService.getContractsByProject(projectId);
          setContracts(data);
          if (data.length === 1) {
            setFormData(prev => ({ ...prev, contract_id: data[0].id }));
          }
        } catch (err) {
          setError('Failed to load contracts');
        } finally {
          setLoadingContracts(false);
        }
      }
    };
    fetchContracts();
  }, [projectId, isOwner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (isOwner && !formData.contract_id) {
      setError('Please select a contractor');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData, receiptFile);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-[90%] max-w-[540px] max-h-[90vh] flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 px-6 border-b border-background-light shrink-0">
          <h2 className="text-lg font-semibold text-text m-0">Add Expense</h2>
          <button className="bg-transparent border-none text-[28px] text-text-light cursor-pointer p-0 w-8 h-8 flex items-center justify-center leading-none" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {error && <div className="bg-error-light text-error p-3 px-4 mx-6 mb-4 rounded-md text-sm shrink-0">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-text">
                  Amount <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 border border-border rounded-md text-[15px] box-border"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-text">
                  Date <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 border border-border rounded-md text-[15px] box-border"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold text-text">
                Vendor/Store <span className="text-error">*</span>
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full py-2.5 px-3 border border-border rounded-md text-[15px] box-border"
                placeholder="e.g., Home Depot, Contractor Name..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold text-text">
                Category <span className="text-error">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full py-2.5 px-3 border border-border rounded-md text-[15px] bg-white box-border"
                required
              >
                <option value="materials">🔨 Materials</option>
                <option value="labor">👷 Labor</option>
                <option value="equipment">🛠️ Equipment</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            {isOwner && (
              <div className="mb-4">
                <label className="block mb-2 text-sm font-semibold text-text">
                  Contractor <span className="text-error">*</span>
                </label>
                <select
                  name="contract_id"
                  value={formData.contract_id}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 border border-border rounded-md text-[15px] bg-white box-border"
                  required
                  disabled={loadingContracts}
                >
                  <option value="">
                    {loadingContracts ? 'Loading contractors...' : 'Select contractor'}
                  </option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.contractor_name} ({contract.contractor_email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold text-text">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full py-2.5 px-3 border border-border rounded-md text-[15px] resize-y box-border"
                placeholder="Add notes about this expense..."
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-semibold text-text">Receipt Photo (Optional)</label>
              {!receiptPreview ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label htmlFor="receipt-upload" className="inline-flex items-center gap-2 py-2.5 px-4 bg-background-light border-2 border-dashed border-border rounded-md cursor-pointer text-sm font-medium text-text">
                    <span className="text-xl">📷</span>
                    <span className="text-sm">Choose File</span>
                  </label>
                  <div className="mt-2 text-xs text-text-light">Max size: 5MB</div>
                </div>
              ) : (
                <div className="mt-2">
                  <img src={receiptPreview} alt="Receipt preview" className="w-full max-h-[200px] object-cover rounded-md mb-2" />
                  <button type="button" className="py-2 px-4 bg-error-light text-error border-none rounded-md text-sm font-medium cursor-pointer" onClick={handleRemoveFile}>
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 p-4 px-6 border-t border-background-light shrink-0">
            <button type="button" className="flex-1 py-3 bg-white text-text border-2 border-border rounded-lg text-[15px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-primary text-white border-none rounded-lg text-[15px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;