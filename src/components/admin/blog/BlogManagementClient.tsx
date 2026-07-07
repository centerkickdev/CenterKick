'use client';

import { useState } from 'react';
import { 
  X, Plus, Trash2, Edit2, Folder, Tag, Image as ImageIcon,
  CheckCircle, AlertCircle, Loader2, ChevronRight, Search
} from 'lucide-react';
import { 
  createCategory, updateCategory, deleteCategory,
  createTag, deleteTag, createAsset, deleteAsset, uploadBlogImage
} from '@/app/admin/blog/actions';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface BlogManagementClientProps {
  categories: Record<string, any>[];
  tags: Record<string, any>[];
  assets: Record<string, any>[];
}

export default function BlogManagementClient({ 
  categories: initialCategories, 
  tags: initialTags, 
  assets: initialAssets 
}: BlogManagementClientProps) {
  const router = useRouter();
  const { showToast, hideToast } = useToast();
  const [activeTab, setActiveTab] = useState<'categories' | 'tags' | 'assets'>('categories');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleOpenPanel = (tab: 'categories' | 'tags' | 'assets') => {
    setActiveTab(tab);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditingId(null);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {[
          { icon: Folder, label: 'Categories', tab: 'categories' as const },
          { icon: Tag, label: 'Tags', tab: 'tags' as const },
          { icon: ImageIcon, label: 'Media Assets', tab: 'assets' as const, href: '/admin/blog/media' },
        ].map((item, i) => {
          const content = (
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
 i === 2 ? 'bg-[#b50a0a]/5 text-[#b50a0a]' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'
 }`}>
                <item.icon className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-black tracking-wide text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
            </div>
          );

          if (item.href) {
            return (
              <Link 
                key={i}
                href={item.href}
                className="group relative bg-white border border-slate-100 px-5 py-2.5 rounded-xl transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
              >
                {content}
              </Link>
            );
          }

          return (
            <button 
              key={i}
              onClick={() => handleOpenPanel(item.tab)}
              className="group relative bg-white border border-slate-100 px-5 py-2.5 rounded-xl transition-all duration-300 hover:border-slate-300 hover:shadow-sm"
            >
              {content}
            </button>
          );
        })}
      </div>

      {isPanelOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] animate-in fade-in duration-300" 
            onClick={closePanel}
          ></div>
          <div className="fixed top-0 right-0 h-screen w-full max-w-xl bg-white z-[210] shadow-2xl p-0 animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-4 md:p-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
               <div>
                  <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                     {activeTab === 'categories' && <Folder className="w-6 h-6 text-[#b50a0a]" />}
                     {activeTab === 'tags' && <Tag className="w-6 h-6 text-[#b50a0a]" />}
                     {activeTab === 'assets' && <ImageIcon className="w-6 h-6 text-[#b50a0a]" />}
                     <span className="text-gray-900">{activeTab}</span>
                  </h3>
                  <p className="text-[9px] font-bold text-gray-400 tracking-wide mt-1">Manage blog taxonomies and media assets</p>
               </div>
               <button onClick={closePanel} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100">
                  <X className="w-5 h-5 text-gray-400" />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar">
               {/* Search bar inside panel */}
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-[11px] font-black tracking-wide focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
                  />
               </div>

               {activeTab === 'categories' && (
                  <div className="space-y-6">
                     <form action={async (formData) => {
                        setIsLoading(true);
                        const res = editingId ? await updateCategory(editingId, formData) : await createCategory(formData);
                         if (res.success) {
                            showToast(editingId ? 'Category updated' : 'Category created', 'success');
                            setEditingId(null);
                         } else {
                            showToast(res.error || 'Failed to save category', 'error');
                         }
                        setIsLoading(false);
                     }} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                        <h4 className="text-[10px] font-black text-gray-900 tracking-wide mb-2 flex items-center gap-2">
                           {editingId ? 'Update' : 'Add New'} Category
                        </h4>
                        <div className="space-y-4">
                           <input 
                             name="name" 
                             required 
                             placeholder="Category Name (e.g. Transfers)" 
                             className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[11px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-300"
                             defaultValue={editingId ? initialCategories.find(c => c.id === editingId)?.name : ''}
                           />
                           <input 
                             name="slug" 
                             placeholder="Custom Slug (Optional)" 
                             className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[11px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-300" 
                             defaultValue={editingId ? initialCategories.find(c => c.id === editingId)?.slug : ''}
                           />
                           <textarea 
                             name="description" 
                             placeholder="Description..." 
                             rows={3}
                             className="w-full bg-white border border-gray-100 rounded-xl p-3 text-[11px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-300 resize-none"
                             defaultValue={editingId ? initialCategories.find(c => c.id === editingId)?.description : ''}
                           />
                           <button 
                             disabled={isLoading}
                             type="submit" 
                             className="w-full bg-black text-white py-3.5 rounded-xl font-black tracking-wide hover:bg-[#b50a0a] transition-all text-[10px] flex items-center justify-center gap-2"
                           >
                              {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (editingId ? 'Update' : 'Create')} Category
                           </button>
                           {editingId && (
                             <button 
                               type="button" 
                               onClick={() => setEditingId(null)}
                               className="w-full py-2 text-[8px] font-black tracking-[0.3em] text-gray-400 hover:text-gray-900"
                             >
                               Cancel Edit
                             </button>
                           )}
                        </div>
                     </form>

                     <div className="space-y-3">
                        {initialCategories
                          .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(category => (
                           <div key={category.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl group hover:border-[#b50a0a]/20 transition-all">
                              <div>
                                 <h5 className="text-[11px] font-black text-gray-900 tracking-tighter">{category.name}</h5>
                                 <p className="text-[9px] text-gray-400 tracking-wide mt-0.5">{category.slug}</p>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => setEditingId(category.id)}
                                   className="p-2 text-gray-400 hover:text-black transition-colors"
                                 >
                                    <Edit2 className="w-3.5 h-3.5" />
                                 </button>
                                 <button 
                                   onClick={async () => {
                                      if (confirm('Delete category?')) {
                                         await deleteCategory(category.id);
                                         showToast('Category deleted', 'success');
                                      }
                                   }}
                                   className="p-2 text-gray-400 hover:text-[#b50a0a] transition-colors"
                                 >
                                    <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {activeTab === 'tags' && (
                  <div className="space-y-6">
                     <form action={async (formData) => {
                        setIsLoading(true);
                        const res = await createTag(formData);
                         if (res.success) {
                            showToast('Tag created', 'success');
                         } else {
                            showToast(res.error || 'Operation failed', 'error');
                         }
                        setIsLoading(false);
                     }} className="flex gap-2">
                        <input 
                          name="name" 
                          required 
                          placeholder="Add New Tag..." 
                          className="flex-1 bg-gray-50 border-none rounded-xl p-4 text-[11px] font-bold focus:ring-1 focus:ring-[#b50a0a] text-black placeholder:text-gray-300"
                        />
                        <button 
                          disabled={isLoading}
                          type="submit" 
                          className="bg-black text-white px-6 rounded-xl font-black tracking-wide hover:bg-[#b50a0a] transition-all text-[10px]"
                        >
                           {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
                        </button>
                     </form>

                     <div className="flex flex-wrap gap-2">
                        {initialTags
                          .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(tag => (
                           <div key={tag.id} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 group transition-all hover:bg-white hover:border-[#b50a0a]/20">
                              <span className="text-[9px] font-black text-gray-900 tracking-wide">{tag.name}</span>
                              <button 
                                onClick={async () => {
                                   if (confirm('Delete tag?')) {
                                      await deleteTag(tag.id);
                                      showToast('Tag deleted', 'success');
                                   }
                                }}
                                className="text-gray-300 hover:text-[#b50a0a] transition-colors"
                              >
                                 <X className="w-3 h-3" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
               {activeTab === 'assets' && (
                  <div className="space-y-8">
                     <div className="p-4 md:p-8 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 text-center group hover:border-[#b50a0a]/30 transition-all cursor-pointer relative overflow-hidden">
                        <input 
                           type="file" 
                           className="absolute inset-0 opacity-0 cursor-pointer" 
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
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                           <Plus className="w-6 h-6 text-[#b50a0a]" />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 tracking-wide">Click to upload media</p>
                        <p className="text-[8px] text-gray-400 tracking-wide mt-1">PNG, JPG or WebP (Max 5MB)</p>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {initialAssets
                          .filter(a => a.filename?.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map(asset => (
                           <div key={asset.id} className="group relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
                              <Image 
                                 src={asset.url} 
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                 alt={asset.filename} 
                                 fill
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                 <button 
                                    onClick={() => {
                                       navigator.clipboard.writeText(asset.url);
                                       showToast('URL copied to clipboard', 'info');
                                    }}
                                    className="w-full py-2 bg-white text-black rounded-lg text-[8px] font-black tracking-wide hover:bg-[#b50a0a] hover:text-white transition-all"
                                 >
                                    Copy Link
                                 </button>
                                 <button 
                                    onClick={async () => {
                                       if (confirm('Delete asset?')) {
                                          await deleteAsset(asset.id, asset.filename);
                                       }
                                    }}
                                    className="w-full py-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 text-red-500 rounded-lg text-[8px] font-black tracking-wide hover:bg-red-600 hover:text-white transition-all"
                                 >
                                    Delete
                                 </button>
                              </div>
                              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                 <p className="text-[7px] font-bold text-white truncate tracking-wide">{asset.filename}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
