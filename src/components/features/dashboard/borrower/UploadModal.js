/**
 * @file src/components/features/borrower/UploadModal.js
 * @description File Upload Modal (Bug Fix: Removed manual Auth header)
 */

import { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadModal({ isOpen, onClose, loanId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('INCOME_VERIFICATION');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('loanId', loanId);
    formData.append('docType', docType);

    try {
      // FIX: Removed 'headers' object. 
      // Browser automatically adds Content-Type: multipart/form-data; boundary=...
      // Cookie automatically handles Authorization.
      const res = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await res.json();

      if (!res.ok) throw new Error(responseData.error?.message || 'Upload failed');

      toast.success('Document uploaded successfully');
      setFile(null); // Reset
      onUploadSuccess(); // Refresh parent list
      onClose();
    } catch (err) {
      toast.error(err.message);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-medium text-slate-900">Upload Document</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Document Type Selector */}
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-slate-700">Document Type</label>
            <select 
              className="input-field" 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="INCOME_VERIFICATION">Paystubs / W-2</option>
              <option value="ASSET_DOCUMENTATION">Bank Statements</option>
              <option value="ID_VERIFICATION">Driver's License / Passport</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Drag & Drop Zone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
              accept=".pdf,.png,.jpg,.jpeg"
            />
            
            {file ? (
              <div className="flex flex-col items-center text-primary-700">
                <FileText className="w-10 h-10 mb-2" />
                <span className="font-medium text-sm truncate max-w-[200px]">{file.name}</span>
                <span className="mt-1 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <UploadCloud className="w-10 h-10 mb-2 text-slate-400" />
                <span className="text-sm font-medium">Click to select file</span>
                <span className="mt-1 text-xs">PDF or Images up to 10MB</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button 
              type="submit" 
              disabled={!file || uploading} 
              className="btn-primary"
            >
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}