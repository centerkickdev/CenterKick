import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

interface Column {
  key: string;
  label: string | React.ReactNode;
  width?: string;
  className?: string;
}

interface DirectoryTableProps<T> {
  data: T[];
  columns: Column[];
  renderRow: (item: T, isSelected: boolean, toggleSelect: () => void, triggerDelete: () => void) => React.ReactNode;
  isPending?: boolean;
  onBatchDelete?: (ids: string[]) => Promise<void>;
  isDeleting?: boolean;
  emptyStateMessage?: string;
  getItemId?: (item: T) => string;
}

export function DirectoryTable<T>({
  data,
  columns,
  renderRow,
  isPending = false,
  onBatchDelete,
  isDeleting = false,
  emptyStateMessage = "No records found.",
  getItemId = (item: any) => item.id
}: DirectoryTableProps<T>) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (data.length === 0) setSelectedIds([]);
  }, [data]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(data.map(getItemId));
    else setSelectedIds([]);
  };

  const handleBatchDeleteClick = () => {
    if (!onBatchDelete) return;
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!onBatchDelete) return;
    setShowConfirmModal(false);
    await onBatchDelete(selectedIds);
    setSelectedIds([]); 
  };

  return (
    <div className="w-full">
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowConfirmModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-[#b50a0a]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Permanently Delete Accounts?</h3>
            <p className="mt-2 text-sm font-bold text-gray-500">
              Are you sure you want to permanently delete {selectedIds.length} selected account(s)? This action cannot be undone and will permanently erase their data.
            </p>
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-[#b50a0a] hover:bg-red-800 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-red-900/20"
              >
                Delete Accounts
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedIds.length > 0 && onBatchDelete && (
        <div className="bg-red-50/80 border-b border-red-100 px-6 py-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-bold text-[#b50a0a]">{selectedIds.length} account(s) selected</span>
          <button 
            onClick={handleBatchDeleteClick} 
            disabled={isDeleting} 
            className="px-4 py-2 bg-[#b50a0a] text-white text-xs font-bold rounded-xl hover:bg-red-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm shadow-red-900/20"
          >
            {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete Selected
          </button>
        </div>
      )}

      <div className="relative overflow-x-auto w-full" ref={dropdownRef}>
        {isPending && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-gray-100 border-t-[#b50a0a] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-gray-400 tracking-wide">Updating View...</p>
            </div>
          </div>
        )}
        
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50/30">
              {onBatchDelete && (
                <th className="px-4 md:px-6 py-5 border-b border-gray-50 w-12 shrink-0">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-[#b50a0a] focus:ring-[#b50a0a]" 
                    checked={selectedIds.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={`px-2 md:px-4 py-5 text-xs font-bold text-gray-400 tracking-wide border-b border-gray-50 ${col.width || ''} ${col.className || ''}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onBatchDelete ? 1 : 0)} className="px-6 py-12 text-center text-sm font-bold text-gray-400">
                  {emptyStateMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = getItemId(item);
                const isSelected = selectedIds.includes(id);
                return renderRow(item, isSelected, () => {
                  setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                }, () => {
                  // Trigger delete for this specific item
                  setSelectedIds([id]);
                  setShowConfirmModal(true);
                });
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
