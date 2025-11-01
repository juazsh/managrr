import React, { useState, useEffect } from 'react';
import contractService  from '../../services/contractService';

const AddPaymentModal = ({ projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    project_id: projectId,
    amount: '',
    payment_method: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
    contract_id: '',
  });
  const [contracts, setContracts] = useState([]);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
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
      if (projectId) {
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
  }, [projectId]);

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
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.contract_id) {
      setError('Please select a contractor');
      setLoading(false);
      return;
    }

    try {
      await onSubmit(formData, screenshotFile);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-[600px] max-h-[90vh] flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
          <h2 className="text-xl font-bold text-text m-0">Add Payment</h2>
          <button className="bg-transparent border-none text-[2rem] text-text-light cursor-pointer p-0 w-8 h-8 flex items-center justify-center leading-none transition-colors duration-200" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="bg-error-light text-error p-4 mx-6 mt-4 rounded-md text-base border border-error shrink-0">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="p-6 overflow-y-auto flex-1 min-h-0">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="mb-4">
                <label className="block mb-2 text-base font-semibold text-text">
                  Amount <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-border rounded-md text-base box-border"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-base font-semibold text-text">
                  Payment Date <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  name="payment_date"
                  value={formData.payment_date}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-border rounded-md text-base box-border"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-base font-semibold text-text">
                Contractor <span className="text-error">*</span>
              </label>
              <select
                name="contract_id"
                value={formData.contract_id}
                onChange={handleChange}
                className="w-full p-3 border-2 border-border rounded-md text-base bg-white box-border"
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

            <div className="mb-4">
              <label className="block mb-2 text-base font-semibold text-text">
                Payment Method <span className="text-error">*</span>
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full p-3 border-2 border-border rounded-md text-base bg-white box-border"
                required
              >
                <option value="cash">💵 Cash</option>
                <option value="bank_transfer">🏦 Bank Transfer</option>
                <option value="zelle">💸 Zelle</option>
                <option value="paypal">💳 PayPal</option>
                <option value="cash_app">💰 Cash App</option>
                <option value="venmo">📱 Venmo</option>
                <option value="other">📋 Other</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-base font-semibold text-text">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full p-3 border-2 border-border rounded-md text-base resize-y box-border"
                placeholder="e.g., Deposit for materials, Week 3 labor payment..."
                rows="3"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-base font-semibold text-text">Payment Screenshot (Optional)</label>
              {!screenshotPreview ? (
                <div className="mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot"
                  />
                  <label htmlFor="screenshot" className="inline-block p-3 px-6 bg-background-light border-2 border-dashed border-border rounded-md cursor-pointer text-base font-medium text-text transition-all duration-200">
                    📷 Choose Screenshot
                  </label>
                </div>
              ) : (
                <div className="mt-2">
                  <img src={screenshotPreview} alt="Preview" className="w-full max-h-[200px] object-cover rounded-md mb-3 border border-border" />
                  <button type="button" className="py-2 px-4 bg-error-light text-error border border-error rounded-md text-sm font-medium cursor-pointer" onClick={handleRemoveFile}>
                    Remove
                  </button>
                </div>
              )}
              <p className="text-sm text-text-light mt-2 mb-0">JPG, JPEG, or PNG (Max 5MB)</p>
            </div>
          </div>

          <div className="flex gap-4 p-6 border-t border-border shrink-0">
            <button type="button" className="flex-1 py-3.5 bg-white text-text border-2 border-border rounded-md text-base font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3.5 bg-primary text-white border-none rounded-md text-base font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;