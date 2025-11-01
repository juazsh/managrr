import React, { useState } from 'react';

const EditExpenseModal = ({ expense, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: expense.amount.toString(),
    vendor: expense.vendor || '',
    date: expense.date,
    category: expense.category,
    description: expense.description || '',
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(expense.receipt_photo_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
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

    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      await onSubmit(expense.id, expenseData, receiptFile);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]" onClick={onClose}>
      <div className="bg-white rounded-lg w-[90%] max-w-[540px] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 px-6 border-b border-background-light">
          <h2 className="text-lg font-semibold text-text m-0">Edit Expense</h2>
          <button className="bg-transparent border-none text-[28px] text-text-light cursor-pointer p-0 w-8 h-8 flex items-center justify-center leading-none" onClick={onClose} type="button">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="bg-error-light text-error p-3 px-4 mx-6 mb-4 rounded-md text-sm">{error}</div>}

          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-text mb-2">
                  Amount <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full py-2.5 px-3 border border-border rounded-md text-sm text-text box-border"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-text mb-2">Date <span className="text-error">*</span></label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full py-2.5 px-3 border border-border rounded-md text-sm text-text box-border"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-text mb-2">Vendor/Store</label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full py-2.5 px-3 border border-border rounded-md text-sm text-text box-border"
                placeholder="Home Depot, Lowe's, etc."
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-text mb-2">
                Category <span className="text-error">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full py-2.5 px-3 border border-border rounded-md text-sm bg-white text-text cursor-pointer box-border"
                required
              >
                <option value="materials">🔨 Materials</option>
                <option value="labor">👷 Labor</option>
                <option value="equipment">🛠️ Equipment</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-text mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full py-2.5 px-3 border border-border rounded-md text-sm text-text resize-y min-h-[80px] box-border"
                placeholder="Add notes about this expense..."
                rows="3"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-text mb-2">Receipt Photo</label>
              {!receiptPreview ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-upload-edit"
                  />
                  <label htmlFor="receipt-upload-edit" className="inline-flex items-center gap-2 py-2.5 px-5 bg-white border-2 border-dashed border-border rounded-md cursor-pointer text-sm font-medium text-text">
                    <span className="text-lg">📷</span>
                    <span className="text-sm">Choose File</span>
                  </label>
                  <div className="mt-2 text-xs text-text-light">Max size: 5MB</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <img src={receiptPreview} alt="Receipt preview" className="w-full max-h-[200px] object-contain rounded-md border border-background-light bg-background-light" />
                  <button type="button" className="self-start py-1.5 px-4 bg-transparent text-error border border-error rounded-md text-sm font-medium cursor-pointer" onClick={handleRemoveFile}>
                    Remove Photo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 px-6 border-t border-background-light">
            <button type="button" className="py-2.5 px-6 bg-white text-text border border-border rounded-md text-sm font-semibold cursor-pointer" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="py-2.5 px-6 bg-primary text-white border-none rounded-md text-sm font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" disabled={loading}>
              {loading ? 'Updating...' : 'Update Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;