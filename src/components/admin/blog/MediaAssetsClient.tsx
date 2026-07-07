'use client';

import { useState } from 'react';
import { 
  X, Plus, Trash2, Image as ImageIcon,
  Search, ChevronLeft, Copy, Check
} from 'lucide-react';
import { 
  createAsset, deleteAsset, uploadBlogImage 
} from '@/app/admin/blog/actions';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface MediaPageProps {
  assets: Record<string, any>[];
}

export default function MediaAssetsClient({ assets: initialAssets }: MediaPageProps) {
  const router = useRouter();
  const { showToast, hideToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAssets = initialAssets.filter(a => 
    a.filename?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/blog" 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 border border-gray-100 shadow-sm transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-[#b50a0a]" />
              Media Assets
            </h1>
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] mt-1">Manage all uploaded visuals and assets for the blog system.</p>
          </div>
        </div>

        <div className="relative group">
           <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIsLoading(true);
                  const toastId = showToast('Uploading asset...', 'loading');
                  
                  const uploadData = new FormData();
                  uploadData.append('file', file);
                  
                  const res = await uploadBlogImage(uploadData);
                  hideToast(toastId);

                  if (res.url) {
                     await createAsset(res.url, file.name, 'image/webp', file.size);
                     showToast('Asset uploaded successfully', 'success');
                     router.refresh();
                  } else {
                     showToast(res.error || 'Upload failed', 'error');
                  }
                  setIsLoading(false);
              }} 
           />
           <button className="bg-black text-white px-4 md:px-8 py-4 rounded-2xl font-black text-[10px] tracking-wide transition-all flex items-center gap-3 shadow-xl hover:bg-[#b50a0a] group-hover:-translate-y-0.5">
              {isLoading ? <Plus className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Upload New Asset
           </button>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between gap-6">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-8 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-black tracking-wide focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-[10px] font-black text-gray-400 tracking-wide">
            {filteredAssets.length} <span className="">Items Found</span>
          </p>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="group relative aspect-square bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all hover:-translate-y-1">
              <Image 
                src={asset.url} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={asset.filename} 
                fill
              />
              
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 p-6 backdrop-blur-[2px]">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(asset.url);
                    setCopiedId(asset.id);
                    showToast('Direct URL copied', 'success');
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="w-full py-3 bg-white text-black rounded-xl text-[9px] font-black tracking-wide flex items-center justify-center gap-2 hover:bg-[#b50a0a] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  {copiedId === asset.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === asset.id ? 'Copied!' : 'Copy Link'}
                </button>
                <button 
                  onClick={async () => {
                    if (confirm('Delete asset permanently?')) {
                      await deleteAsset(asset.id, asset.filename);
                      showToast('Asset removed', 'success');
                    }
                  }}
                  className="w-full py-3 bg-red-600/20 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black tracking-wide flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 delay-75 duration-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>

              <div className="absolute top-4 left-4">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                   <p className="text-[7px] font-black text-white tracking-wide truncate max-w-full max-w-[100px]">
                      {asset.filename.split('.').pop()}
                   </p>
                </div>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[8px] font-black text-white truncate tracking-wide drop-shadow-lg">
                    {asset.filename}
                  </p>
              </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full py-32 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
             <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
             <p className="text-sm font-black tracking-wide text-gray-400">No assets matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
