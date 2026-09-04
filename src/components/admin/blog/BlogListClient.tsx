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
      <div className="p-3.5 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles by title or summary..."
            className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold focus:ring-4 focus:ring-black/5 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-56 group">
            <select
              suppressHydrationWarning
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-bold tracking-wide text-slate-900 focus:ring-4 focus:ring-black/5 transition-all appearance-none cursor-pointer pr-10"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-900 transition-colors">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content List */}
      {filteredPosts.length === 0 ? (
        <div className="px-4 md:px-8 py-20 text-center">
          <FileText className="w-12 h-12 text-gray-100 mx-auto mb-4" />
          <p className="text-sm font-bold tracking-wide text-gray-400">No matching content found.</p>
        </div>
      ) : (
        <>
          {/* Card List View (Mobile & Tablet: < lg) */}
          <div className="block lg:hidden divide-y divide-slate-100">
            {paginatedPosts.map((post) => (
              <div key={post.id} className="p-4 sm:p-5 space-y-3 bg-white hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {post.cover_image_url && (
                    <div className="relative w-16 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-red-50 text-[#b50a0a] border border-red-100/80 px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                        {post.category?.name || 'Uncategorized'}
                      </span>
                      <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {post.author?.email && (
                        <>
                          <span className="hidden sm:inline text-slate-300">•</span>
                          <span className="hidden sm:inline text-[11px] text-slate-400 font-medium truncate max-w-[180px]" title={post.author.email}>
                            {post.author.email}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 leading-snug text-sm sm:text-base line-clamp-2 hover:text-[#b50a0a] transition-colors">
                      {post.title}
                    </h3>

                    {post.excerpt && (
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Meta & Actions */}
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-slate-50">
                  <button
                    onClick={() => handleToggleStatus(post.id, post.published_at)}
                    disabled={loadingId === post.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border transition-all ${post.published_at
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                      : 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${post.published_at ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span>{post.published_at ? 'Published' : 'Draft'}</span>
                    {loadingId === post.id && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/news/${post.slug}`}
                      target="_blank"
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                      title="View Article"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View</span>
                    </Link>

                    <Link
                      href={`/admin/blog/edit/${post.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-900 hover:text-white transition-colors shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={loadingId === post.id}
                      className="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-[#b50a0a] hover:text-white transition-colors shadow-sm"
                      title="Delete Article"
                    >
                      {loadingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= lg) */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-400 text-left">Article</th>
                  <th className="w-[140px] px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-400 text-left">Status</th>
                  <th className="w-[180px] px-6 py-4 text-xs font-bold tracking-wider uppercase text-slate-400 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {paginatedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start sm:items-center gap-4 max-w-xl">
                        {post.cover_image_url ? (
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-xs mt-0.5 sm:mt-0">
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100 mt-0.5 sm:mt-0">
                            <FileText className="w-6 h-6 text-slate-300" />
                          </div>
                        )}

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-red-50 text-[#b50a0a] border border-red-100/80 px-2.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider inline-block truncate">
                              {post.category?.name || 'Uncategorized'}
                            </span>
                          </div>

                          <p className="font-bold text-slate-900 leading-snug group-hover:text-[#b50a0a] transition-colors truncate" title={post.title}>
                            {post.title}
                          </p>

                          <p className="text-xs text-slate-400 line-clamp-1">
                            {post.excerpt || 'No excerpt provided...'}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                            <span className="truncate max-w-[160px]" title={post.author?.email}>
                              {post.author?.email || 'System'}
                            </span>
                            <span>•</span>
                            <span>{new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(post.id, post.published_at)}
                        disabled={loadingId === post.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${post.published_at
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${post.published_at ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>{post.published_at ? 'Published' : 'Draft'}</span>
                        {loadingId === post.id && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/news/${post.slug}`}
                          target="_blank"
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-xs"
                          title="View Live Article"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>

                        <Link
                          href={`/admin/blog/edit/${post.id}`}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-900 hover:text-white transition-all shadow-xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          disabled={loadingId === post.id}
                          className="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-[#b50a0a] hover:text-white transition-all shadow-xs"
                          title="Delete Article"
                        >
                          {loadingId === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-400 tracking-wide">
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
                className={`w-9 h-9 rounded-xl text-xs font-bold tracking-wide transition-all ${currentPage === page
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
