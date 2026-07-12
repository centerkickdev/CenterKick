'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, Plus, Trash2, Image as ImageIcon, 
  Loader2, Search, Check, UploadCloud, 
  MousePointer2 
} from 'lucide-react';
import { getAssets, uploadBlogImage, deleteAsset } from '@/app/admin/blog/actions';
import { useToast } from '@/context/ToastContext';

interface MediaGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
}

export default function MediaGallery({ isOpen, onClose, onSelect, title = "Media Gallery" }: MediaGalleryProps) {
  const { showToast, hideToast } = useToast();
  const [assets, setAssets] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAssets(50, 0, true);
    }
  }, [isOpen]);

  async function loadAssets(limit = 50, offset = 0, reset = false) {
    setIsLoading(true);
    const res = await getAssets(limit, offset, searchQuery);
    if (res.assets) {
      setAssets(prev => reset ? res.assets : [...prev, ...res.assets]);
      setTotalCount(res.totalCount || 0);
      setHasMore(res.hasMore || false);
    } else if (res.error) {
      showToast(res.error, 'error');
    }
    setIsLoading(false);
  }

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    loadAssets(50, 0, true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = showToast('Uploading...', 'loading');
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await uploadBlogImage(formData);
    hideToast(toastId);

    if (res.url) {
      showToast('Uploaded', 'success');
      await loadAssets(50, 0, true);
    } else {
      showToast(res.error || 'Upload failed', 'error');
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (e: React.MouseEvent, asset: any) => {
    e.stopPropagation();
    if (!confirm('Delete this asset?')) return;

    const toastId = showToast('Deleting...', 'loading');
    const res = await deleteAsset(asset.id, asset.filename);
    hideToast(toastId);

    if (res.success) {
      showToast('Removed', 'success');
      setAssets(assets.filter(a => a.id !== asset.id));
      if (selectedAssetId === asset.id) setSelectedAssetId(null);
      setTotalCount(prev => prev - 1);
    } else {
      showToast(res.error || 'Delete failed', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100">
        <div className="px-4 md:px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ImageIcon className="w-5 h-5 text-[#b50a0a]" />
            <h3 className="text-base font-bold text-black tracking-wide">{title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 md:px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search visuals..." 
              className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-red-50 transition-all placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          
          <button 
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all"
          >
            {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
            Upload New
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} />
          <p className="text-xs font-bold text-gray-900 tracking-wide ml-auto">
            {assets.length} / {totalCount} Assets
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
          {isLoading && assets.length === 0 ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-100" /></div>
          ) : assets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <ImageIcon className="w-10 h-10 mb-4" />
              <p className="text-xs font-bold tracking-wide">Nothing here yet</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                {assets.map((asset) => (
                  <div key={asset.id} className="space-y-2">
                    <div 
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all shadow-sm ${
 selectedAssetId === asset.id ? 'border-[#b50a0a]' : 'border-transparent'
 }`}
                    >
                      <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-black/40 transition-opacity ${selectedAssetId === asset.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <button 
                          onClick={(e) => handleDelete(e, asset)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 rounded-lg text-white hover:bg-red-700 shadow-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {selectedAssetId === asset.id && (
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#b50a0a] rounded-full flex items-center justify-center text-white shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-gray-500 truncate px-1 text-center" title={asset.filename}>
                      {asset.filename}
                    </p>
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => loadAssets(50, assets.length)}
                    disabled={isLoading}
                    className="px-4 md:px-8 py-3 bg-gray-50 border border-gray-100 text-gray-900 rounded-xl text-xs font-bold tracking-wide hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                    Load More Assets
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 md:px-8 py-6 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500 tracking-wide">
            JPG / PNG / WebP • Optimized for Web
          </p>
          <button 
            disabled={!selectedAssetId}
            onClick={() => {
              const asset = assets.find(a => a.id === selectedAssetId);
              if (asset) onSelect(asset.url);
              onClose();
            }}
            className="flex items-center gap-2 px-4 md:px-8 py-3 bg-[#b50a0a] text-white rounded-xl text-xs font-bold tracking-wide hover:bg-black transition-all disabled:opacity-50 shadow-lg"
          >
            Insert into post
            <MousePointer2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

