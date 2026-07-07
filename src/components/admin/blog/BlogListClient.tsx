'use client';

import { useState, useMemo, useEffect } from 'react';
import { Edit3, Trash2, FileText, Loader2, Eye, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { deletePost, togglePostStatus } from '@/app/admin/blog/actions';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

interface BlogListClientProps {
  initialPosts: Record<string, any>[];
}

export default function BlogListClient({ initialPosts }: BlogListClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setLoadingId(id);
    const res = await deletePost(id);
    if (res?.error) {
      showToast(res.error, 'error');
    } else {
      showToast('Post deleted successfully', 'success');
      router.refresh();
    }
    setLoadingId(null);
  };

  const handleToggleStatus = async (id: string, currentPublishedAt: string | Date | null) => {
    setLoadingId(id);
    const res = await togglePostStatus(id, !!currentPublishedAt);
    if (res?.error) {
      showToast(res.error, 'error');
    } else {
      showToast(currentPublishedAt ? 'Post moved to Drafts' : 'Post published', 'success');
      router.refresh();
    }
    setLoadingId(null);
  };

  // Get unique categories from posts for the dropdown filter
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    initialPosts.forEach(post => {
      if (post.category_id && post.category?.name) {
        map.set(post.category_id, post.category.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [initialPosts]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return initialPosts.filter(post => {
      const matchesSearch =
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || post.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [initialPosts, searchQuery, selectedCategory]);

  // Paginated posts
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPosts.slice(start, start + itemsPerPage);
  }, [filteredPosts, currentPage]);

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

  if (!mounted) {
    return (
      <div className="flex flex-col bg-white rounded-3xl min-h-[400px] items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Search & Filter Bar */}
      <div className="p-6 border-b border-gray-100 bg-white flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles by title or summary..."
            className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-sm font-semibold focus:ring-4 focus:ring-black/5 focus:bg-white transition-all text-black placeholder:text-gray-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-64 group">
            <select
              suppressHydrationWarning
              className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-black tracking-wide text-black focus:ring-4 focus:ring-black/5 transition-all appearance-none cursor-pointer pr-10"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      {filteredPosts.length === 0 ? (
        <div className="px-4 md:px-8 py-20 text-center">
          <FileText className="w-12 h-12 text-gray-100 mx-auto mb-4" />
          <p className="text-sm font-black tracking-wide text-gray-400">No matching content found.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-base text-gray-600 table-fixed border-collapse whitespace-nowrap">
            <thead className="bg-[#f8f9fa] border-b border-gray-100">
              <tr>
                <th className="px-4 md:px-8 py-5 text-[10px] font-black tracking-wide text-gray-400 text-left">Title &amp; Excerpt</th>
                <th className="hidden sm:table-cell w-[18%] px-4 md:px-8 py-5 text-[10px] font-black tracking-wide text-gray-400 text-left">Category</th>
                <th className="hidden sm:table-cell w-[15%] px-4 md:px-8 py-5 text-[10px] font-black tracking-wide text-gray-400 text-left">Status</th>
                <th className="w-full max-w-[130px] px-4 md:px-8 py-5 text-[10px] font-black tracking-wide text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 md:px-8 py-6">
                    <div className="max-w-full space-y-1.5">
                      <p className="font-bold text-gray-900 leading-tight group-hover:text-[#b50a0a] transition-colors line-clamp-1 break-words">{post.title}</p>
                      <p className="text-[10px] text-gray-400 line-clamp-1 break-words">{post.excerpt || 'No excerpt provided...'}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[9px] font-black tracking-wide text-gray-400">
                        <span className="text-gray-500 lowercase font-bold normal-case truncate max-w-full max-w-[150px] block" title={post.author?.email}>
                          {post.author?.email || 'System'}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-4 md:px-8 py-6 whitespace-nowrap">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[9px] font-black tracking-wide inline-block truncate max-w-full">
                      {post.category?.name || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 md:px-8 py-6 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(post.id, post.published_at)}
                      disabled={loadingId === post.id}
                      className="flex items-center gap-2 group/status"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full transition-transform group-hover/status:scale-150 ${post.published_at ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-gray-300'}`}></div>
                      <span className={`text-[10px] font-black tracking-wide transition-colors ${post.published_at ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}>
                        {post.published_at ? 'Published' : 'Draft'}
                      </span>
                      {loadingId === post.id && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                    </button>
                  </td>
                  <td className="px-4 md:px-8 py-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <div className="relative group/btn">
                        <Link
                          href={`/news/${post.slug}`}
                          target="_blank"
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black tracking-wide rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                          View
                        </span>
                      </div>

                      <div className="relative group/btn">
                        <Link
                          href={`/admin/blog/edit/${post.id}`}
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm shrink-0"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black tracking-wide rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                          Edit
                        </span>
                      </div>

                      <div className="relative group/btn">
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={loadingId === post.id}
                          className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-[#b50a0a] hover:text-white transition-all shadow-sm shrink-0"
                        >
                          {loadingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                        <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black tracking-wide rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                          Delete
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-gray-400 tracking-wide">
            Showing <span className="text-black">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="text-black">
              {Math.min(currentPage * itemsPerPage, filteredPosts.length)}
            </span>{' '}
            of <span className="text-black">{filteredPosts.length}</span> articles
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-xl text-[10px] font-black tracking-wide transition-all ${currentPage === page
 ? 'bg-slate-900 text-white shadow-md'
 : 'border border-gray-100 hover:bg-gray-50'
 }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
