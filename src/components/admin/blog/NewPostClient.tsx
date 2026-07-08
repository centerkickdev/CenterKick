'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { TextAlign as TiptapTextAlign } from '@tiptap/extension-text-align';
import { TextStyle as TiptapTextStyle } from '@tiptap/extension-text-style';
import { Color as TiptapColor } from '@tiptap/extension-color';
import { Node } from '@tiptap/core';
import { 
  Save, Globe, Eye, Settings, Image as ImageIcon, 
  ChevronLeft, X, Check, Loader2, Link as LinkIcon,
  Bold, Italic, List, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Quote, Undo, Redo, Plus, Trash2,
  Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
  ChevronDown, FileText, Send, Trash, History, ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import NextImage from 'next/image';
import { createPost, updatePost, uploadBlogImage, quickCreateTag, isSlugUnique, deletePost } from '@/app/admin/blog/actions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import MediaGallery from './MediaGallery';
import { motion, AnimatePresence } from 'framer-motion';

// Custom format helper for datetime-local input
const formatDatetimeLocal = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const tzoffset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
  return localISOTime;
};

// Custom Tiptap Extension for Link Previews
const LinkPreviewExtension = Node.create({
  name: 'linkPreview',
  group: 'block',
  content: 'inline*',
  defining: true,
  
  addAttributes() {
    return {
      url: { default: '' },
      title: { default: '' },
      description: { default: '' },
      image: { default: '' },
      domain: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-link-preview]',
        getAttrs: dom => {
          const element = dom as HTMLElement;
          return {
            url: element.getAttribute('data-link-preview') || element.getAttribute('href') || '',
            title: element.getAttribute('data-title') || '',
            description: element.getAttribute('data-description') || '',
            image: element.getAttribute('data-image') || '',
            domain: element.getAttribute('data-domain') || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { url, title, description, image, domain } = HTMLAttributes;
    return [
      'a',
      {
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'link-preview-card border border-slate-200/60 rounded-3xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row gap-6 items-center my-8 cursor-pointer shadow-sm hover:shadow-md max-w-2xl mx-auto no-underline',
        'data-link-preview': url,
        'data-title': title,
        'data-description': description,
        'data-image': image,
        'data-domain': domain,
        style: 'text-decoration: none !important; display: flex;',
      },
      [
        'div',
        { class: 'flex-1 min-w-0 space-y-2', style: 'text-align: left;' },
        ['span', { class: 'text-xs font-bold  text-[#b50a0a] tracking-wide block', style: 'margin-bottom: 4px;' }, 'External Link'],
        ['h4', { class: 'text-base font-bold text-slate-900  tracking-tight line-clamp-2 no-underline', style: 'margin: 0; color: #0f172a; text-decoration: none !important;' }, title],
        ['p', { class: 'text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed no-underline', style: 'margin: 4px 0 0 0; color: #64748b; text-decoration: none !important;' }, description],
        ['span', { class: 'text-xs font-bold text-slate-400  tracking-wide block', style: 'margin-top: 4px; color: #94a3b8;' }, domain],
      ],
      ...(image ? [
        [
          'div',
          { class: 'w-full md:w-36 aspect-[4/3] md:aspect-square bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200/50' },
          ['img', { src: image, class: 'w-full h-full object-cover', alt: 'Preview Thumbnail' }],
        ]
      ] : []),
    ];
  },
});

function ImageCaptionInput({ editor }: { editor: any }) {
  const [caption, setCaption] = useState(editor?.getAttributes('image').alt || '');
  
  useEffect(() => {
    setCaption(editor?.getAttributes('image').alt || '');
  }, [editor?.getAttributes('image').alt]);

  return (
    <input
      type="text"
      placeholder="Image Caption / Photo Credit..."
      className="px-3 py-1.5 bg-gray-50 rounded-xl text-xs font-bold text-black border border-gray-100 focus:ring-0 focus:border-[#b50a0a]/30 w-44"
      value={caption}
      onChange={(e) => setCaption(e.target.value)}
      onBlur={() => {
        editor?.chain().focus().updateAttributes('image', {
          alt: caption,
          title: caption
        }).run();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          editor?.chain().focus().updateAttributes('image', {
            alt: caption,
            title: caption
          }).run();
        }
      }}
    />
  );
}

interface NewPostClientProps {
  categories: Record<string, any>[];
  tags: Record<string, any>[];
  post?: Record<string, any>;
}

export default function NewPostClient({ categories, tags, post }: NewPostClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    category_id: post?.category_id || '',
    cover_image_url: post?.cover_image_url || '',
    is_draft: post?.is_draft ?? true,
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
    og_image_url: post?.og_image_url || '',
    published_at: post?.published_at ? formatDatetimeLocal(post.published_at) : '',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    post?.post_tags?.map((pt: any) => pt.tag_id) || []
  );
  const [availableTags, setAvailableTags] = useState(tags);
  const [tagSearch, setTagSearch] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'unique' | 'duplicate'>('idle');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryUsage, setGalleryUsage] = useState<'editor' | 'cover'>('editor');
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(post?.updated_at ? new Date(post.updated_at) : null);
  const saveOptionsRef = useRef<HTMLDivElement>(null);
  const [currentPostId, setCurrentPostId] = useState<string | null>(post?.id || null);

  const isHighlight = selectedTags.some(tagId => {
    const tag = availableTags.find(t => t.id === tagId || t.name === tagId);
    return tag && tag.name.toLowerCase() === 'highlights';
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-[2.5rem] shadow-2xl border border-gray-100 my-12 max-h-[800px] mx-auto transition-all hover:scale-[1.01]',
        },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#b50a0a] underline font-bold transition-all hover:text-black decoration-2 underline-offset-4',
        },
      }),
      TiptapUnderline,
      TiptapTextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TiptapTextStyle,
      TiptapColor,
      BubbleMenuExtension,
      LinkPreviewExtension,
    ],
    content: post?.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[600px] max-w-none px-4 sm:px-0 selection:bg-[#b50a0a]/10 text-black prose-headings:text-black prose-p:text-black prose-strong:text-black prose-blockquote:text-black prose-li:text-black',
      },
    },
  });

  // Enforce slug logic with uniqueness check
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.title) {
        const baseSlug = formData.title
          .toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');

        if (baseSlug === formData.slug && slugStatus !== 'idle') return;

        setSlugStatus('checking');
        
        let finalSlug = baseSlug;
        let suffix = 1;
        
        while (true) {
          const isUnique = await isSlugUnique(finalSlug, post?.id);
          if (isUnique) break;
          finalSlug = `${baseSlug}-${suffix}`;
          suffix++;
        }

        setFormData(prev => ({ ...prev, slug: finalSlug }));
        setSlugStatus('unique');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.title, post?.id]);

  // Auto-save logic (5 minutes)
  useEffect(() => {
    if (!currentPostId || formData.is_draft === false) return;

    const timer = setInterval(async () => {
      if (!formData.title || !editor) return;
      
      const submissionData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'is_draft') submissionData.append(key, String(value));
      });
      submissionData.set('content', editor.getHTML());
      submissionData.set('published', 'false');
      submissionData.set('tags', JSON.stringify(selectedTags));

      const res = await updatePost(currentPostId, submissionData);
      if (!res.error) {
        setLastSaved(new Date());
        showToast('Draft auto-saved', 'success');
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(timer);
  }, [currentPostId, formData, editor, selectedTags]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (saveOptionsRef.current && !saveOptionsRef.current.contains(event.target as globalThis.Node)) {
        setShowSaveOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveAction = async (action: 'draft' | 'publish' | 'delete') => {
    if (action === 'delete') {
      if (!currentPostId) {
        setFormData({
          title: '', slug: '', excerpt: '', category_id: '',
          cover_image_url: '', is_draft: true, meta_title: '',
          meta_description: '', og_image_url: '', published_at: '',
        });
        editor?.commands.setContent('');
        setSelectedTags([]);
        showToast('Post cleared', 'success');
        return;
      }
      if (!confirm('Are you sure you want to delete this post?')) return;
      setIsLoading(true);
      const res = await deletePost(currentPostId);
      if (res.success) {
        showToast('Post deleted', 'success');
        router.push('/admin/blog');
      } else {
        showToast(res.error || 'Delete failed', 'error');
      }
      setIsLoading(false);
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      showToast('A title is required to save.', 'error');
      return;
    }

    if (!formData.excerpt || !formData.excerpt.trim()) {
      showToast('An excerpt is required to save.', 'error');
      return;
    }

    setIsLoading(true);
    const publish = action === 'publish';
    
    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'is_draft') submissionData.append(key, String(value));
    });
    
    submissionData.set('content', editor?.getHTML() || '');
    submissionData.set('published', publish ? 'true' : 'false');
    submissionData.set('tags', JSON.stringify(selectedTags));

    const res = currentPostId 
      ? await updatePost(currentPostId, submissionData) 
      : await createPost(submissionData);

    if (res?.error) {
      showToast(res.error, 'error');
    } else {
      showToast(publish ? 'Post Published' : 'Draft Saved', 'success');
      setLastSaved(new Date());
      if ('id' in res && res.id && !currentPostId) {
        setCurrentPostId(res.id);
        window.history.replaceState(null, '', `/admin/blog/edit/${res.id}`);
      }
      setFormData(prev => ({ ...prev, is_draft: !publish }));
    }
    setIsLoading(false);
    setShowSaveOptions(false);
  };

  const handleSlugChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/\s+/g, '-').slice(0, 60);
    setFormData(prev => ({ ...prev, slug: sanitized }));
  };

  const handleCreateTag = async (name: string) => {
    if (!name.trim()) return;
    setIsCreatingTag(true);
    const res = await quickCreateTag(name.trim());
    if (res.tag) {
      setAvailableTags([...availableTags, res.tag]);
      setSelectedTags([...selectedTags, res.tag.id]);
      setTagSearch('');
      setShowTagDropdown(false);
      showToast('Tag created', 'success');
    } else {
      showToast(res.error || 'Failed to create tag', 'error');
    }
    setIsCreatingTag(false);
  };

  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) && 
    !selectedTags.includes(tag.id)
  );

  const insertLinkPreview = async () => {
    const url = window.prompt('Enter the link URL for the preview:');
    if (!url) return;

    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }

    showToast('Fetching link preview...', 'success');

    try {
      const res = await fetch(`/api/link-preview?url=${encodeURIComponent(formattedUrl)}`);
      const data = await res.json();

      editor?.chain().focus().insertContent({
        type: 'linkPreview',
        attrs: {
          url: formattedUrl,
          title: data.title || data.domain,
          description: data.description || '',
          image: data.image || '',
          domain: data.domain,
        },
      }).run();
      
      showToast('Link preview card inserted', 'success');
    } catch (error) {
      showToast('Failed to fetch link preview, inserting regular link', 'error');
      editor?.chain().focus().insertContent(`<p><a href="${formattedUrl}" target="_blank">${url}</a></p>`).run();
    }
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap items-center gap-1 p-2 mb-8 bg-white/80 backdrop-blur-xl sticky top-4 z-40 border-b border-gray-100/50">
        <div className="flex items-center gap-0.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100/50">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('') ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('underline') ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="w-px h-4 bg-gray-200 mx-2"></div>
        
        <div className="flex items-center gap-0.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100/50">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 3 }) ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 4 }) ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <Heading4 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-0.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100/50">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: 'left' }) ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: 'center' }) ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive({ textAlign: 'right' }) ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-0.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100/50">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg transition-all ${editor.isActive('blockquote') ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-0.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100/50">
          <button
            onClick={() => {
              const url = window.prompt('URL');
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            className={`p-2 rounded-lg transition-all ${editor.isActive('link') ? 'bg-black text-white shadow-sm' : 'hover:bg-white text-gray-400 hover:text-black'}`}
            title="Insert Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={insertLinkPreview}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all"
            title="Insert Link Preview Card"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setGalleryUsage('editor');
              setIsGalleryOpen(true);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-black transition-all"
            title="Select Image from Gallery"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-48 animate-in fade-in duration-1000">
      <div 
        className="sticky z-[100] w-[calc(100%+4rem)] -mx-8 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
        style={{ top: '-32px' }}
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link 
            href="/admin/blog" 
            className="flex items-center gap-2 text-xs font-bold tracking-wide text-black hover:text-[#b50a0a] transition-all group shrink-0"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Post Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold tracking-wide text-gray-400">
                <History className="w-3 h-3" />
                Last Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}

            <div className="relative" ref={saveOptionsRef}>
              <button 
                onClick={() => setShowSaveOptions(!showSaveOptions)}
                disabled={isLoading}
                className="flex items-center gap-3 px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-all shadow-lg active:scale-95 group"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Post
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showSaveOptions ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showSaveOptions && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 5, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full w-56 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-[60]"
                  >
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => handleSaveAction('draft')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wide text-gray-600 hover:bg-gray-50 hover:text-black rounded-lg transition-all"
                      >
                        <FileText className="w-4 h-4 text-gray-400" />
                        Save to Draft
                      </button>
                      <button 
                        onClick={() => handleSaveAction('publish')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wide text-gray-600 hover:bg-[#b50a0a]/5 hover:text-[#b50a0a] rounded-lg transition-all"
                      >
                        <Send className="w-4 h-4 text-[#b50a0a]/60" />
                        Publish Now
                      </button>
                      <div className="h-px bg-gray-50 my-1"></div>
                      <button 
                        onClick={() => handleSaveAction('delete')}
                        className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-wide text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash className="w-4 h-4 text-red-500/60" />
                        Delete Post
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col transition-all">
          <div className="p-4 md:p-8 sm:p-12 space-y-12">
             <div className="space-y-8">
                <div className="space-y-2 group">
                   <label className="text-xs font-bold text-black tracking-wide ml-1 opacity-100">Title</label>
                   <textarea 
                      rows={1}
                      placeholder="The Title of Your Story..." 
                      className="w-full bg-transparent border-none p-0 text-xl sm:text-3xl font-bold text-black placeholder:text-gray-200 focus:ring-0 leading-tight transition-all resize-none min-h-[1em] overflow-hidden"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                   />
                </div>
 
                <div className="space-y-2">
                   <label className="text-xs font-bold text-black tracking-wide ml-1">Slug</label>
                   <div className="flex items-center gap-2 text-xs font-bold text-gray-900 bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 w-full max-w-2xl group focus-within:border-black/10 transition-all">
                      <LinkIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="opacity-40 shrink-0">centerkick.com/news/</span>
                      <input 
                         type="text" 
                         maxLength={60}
                         placeholder="post-url-identifier"
                         className={`bg-transparent border-none p-0 text-xs focus:ring-0 flex-1 font-bold transition-colors ${
 slugStatus === 'unique' ? 'text-green-600' : 'text-black'
 }`}
                         value={formData.slug}
                         onChange={(e) => handleSlugChange(e.target.value)}
                      />
                      <div className="flex items-center gap-2 shrink-0 border-l border-gray-200 pl-3 ml-1">
                        <span className="text-xs text-gray-400 font-bold tracking-tighter">{formData.slug.length}/60</span>
                        {slugStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                        {slugStatus === 'unique' && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />}
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold text-black tracking-wide ml-1">
                  {isHighlight ? 'External Link (YouTube, etc.)' : 'Excerpt'} <span className="text-[#b50a0a] ml-0.5">*</span>
                </label>
                <textarea 
                   rows={isHighlight ? 1 : 3} 
                   placeholder={isHighlight ? "https://www.youtube.com/watch?v=..." : "Short summary for the index page..."}
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-5 text-xs font-bold focus:ring-4 focus:ring-black/5 transition-all text-black placeholder:text-gray-300 resize-none shadow-sm"
                   value={formData.excerpt}
                   onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
             </div>

             <div className="w-full h-px bg-gray-100/50"></div>

             {!isHighlight && (
               <div className="space-y-8">
                  <div className="flex items-center justify-between ml-1 leading-none">
                     <label className="text-xs font-bold text-black tracking-wide">Body Content</label>
                  </div>
                  <MenuBar />
                <div className="relative editor-content-area">
                  {editor && (
                    <BubbleMenu 
                      editor={editor} 
                      shouldShow={({ editor }) => editor.isActive('image')}
                    >
                      <div className="flex items-center bg-white shadow-2xl border border-gray-100 rounded-2xl p-1.5 gap-1.5 animate-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => {
                            setGalleryUsage('editor');
                            setIsGalleryOpen(true);
                          }}
                          className="px-3 py-2 hover:bg-gray-50 rounded-xl text-black flex items-center gap-2 text-xs font-bold tracking-wide transition-all shrink-0"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#b50a0a]" />
                          Replace
                        </button>
                        <div className="w-px h-4 bg-gray-100 self-center shrink-0"></div>
                        <ImageCaptionInput editor={editor} />
                        <div className="w-px h-4 bg-gray-100 self-center shrink-0"></div>
                        <button 
                          onClick={() => editor?.chain().focus().deleteSelection().run()}
                          className="px-3 py-2 hover:bg-red-50 rounded-xl text-red-600 flex items-center gap-2 text-xs font-bold tracking-wide transition-all shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </BubbleMenu>
                  )}
                  <EditorContent editor={editor} />
                </div>
             </div>
             )}
          </div>

          <div className="bg-gray-50/30 border-t border-gray-100 p-4 md:p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                 <div className="space-y-2">
                    <h4 className="text-xs font-bold text-black tracking-[0.2em] flex items-center gap-2">
                       <Settings className="w-4 h-4 text-[#b50a0a]" />
                       Post Settings
                    </h4>
                    <p className="text-xs text-gray-500 font-bold tracking-wide">Metadata & Discovery</p>
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-xs font-bold text-black tracking-wide ml-1">Category</label>
                    <div className="relative group">
                      <select 
                        className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold tracking-wide text-black focus:ring-4 focus:ring-black/5 transition-all appearance-none cursor-pointer pr-12 shadow-sm"
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      >
                         <option value="">Uncategorized</option>
                         {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                         ))}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-black transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                 </div>

                 {/* Backdating Published Date Selection */}
                 <div className="space-y-4">
                    <label className="text-xs font-bold text-black tracking-wide ml-1">Published Date (Backdate)</label>
                    <input 
                       type="datetime-local" 
                       className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-xs font-bold tracking-wide text-black focus:ring-4 focus:ring-black/5 transition-all shadow-sm"
                       value={formData.published_at}
                       onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                    />
                    <p className="text-xs font-bold text-gray-400 pl-1 tracking-wide">Leave blank to use current time on publish, or select a date/time to backdate.</p>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center justify-between ml-1">
                       <label className="text-xs font-bold text-black tracking-wide">Tags</label>
                       <span className="text-xs font-bold text-gray-900 tracking-wide opacity-40">{selectedTags.length} SELECTED</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5 min-h-[60px] p-5 bg-white rounded-2xl border border-gray-100 shadow-sm relative group focus-within:border-[#b50a0a]/20 transition-all">
                       {selectedTags.map(tagId => {
                          const tag = availableTags.find(t => t.id === tagId || t.name === tagId);
                          if (!tag) return null;
                          return (
                            <button 
                              key={tag.id || tag.name}
                              onClick={() => setSelectedTags(selectedTags.filter(id => id !== (tag.id || tag.name)))}
                              className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-black hover:bg-black hover:text-white transition-all flex items-center gap-2 group/tag shadow-sm tracking-tighter"
                            >
                              {tag.name}
                              <X className="w-3 h-3 text-gray-300 group-hover/tag:text-white transition-colors" />
                            </button>
                          );
                       })}
                       {selectedTags.length === 0 && (
                          <span className="text-xs font-bold text-gray-200 tracking-wide w-full text-center py-2 font-serif">Connect keywords...</span>
                       )}
                    </div>
                    
                    <div className="relative">
                       <div className="flex items-center gap-3 bg-white rounded-2xl p-2 border border-gray-100 focus-within:ring-4 focus-within:ring-black/5 transition-all shadow-sm">
                          <Plus className="w-5 h-5 ml-2 text-gray-300" />
                          <input 
                             type="text" 
                             placeholder="Search tags..."
                             className="flex-1 bg-transparent border-none text-xs font-bold text-black placeholder:text-gray-300 focus:ring-0 py-2.5"
                             value={tagSearch}
                             onChange={(e) => {
                               setTagSearch(e.target.value);
                               setShowTagDropdown(e.target.value.length >= 3);
                             }}
                             onFocus={() => tagSearch.length >= 3 && setShowTagDropdown(true)}
                          />
                       </div>

                       {showTagDropdown && (
                         <div className="absolute bottom-full left-0 right-0 mb-4 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-300">
                           <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-end">
                             <Check className="w-3 h-3 text-gray-300" />
                           </div>
                           <div className="max-h-[220px] overflow-y-auto p-2 space-y-1">
                             {filteredTags.map(tag => (
                               <button
                                 key={tag.id || tag.name}
                                 onClick={() => {
                                   setSelectedTags([...selectedTags, tag.id || tag.name]);
                                   setTagSearch('');
                                   setShowTagDropdown(false);
                                 }}
                                 className="w-full text-left px-4 py-3 hover:bg-[#b50a0a] rounded-xl flex items-center justify-between group transition-all"
                                >
                                 <span className="text-xs font-bold text-black group-hover:text-white tracking-wide">{tag.name}</span>
                                 <Plus className="w-4 h-4 text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                               </button>
                             ))}
                             
                             {tagSearch.trim() && !availableTags.find(t => t.name.toLowerCase() === tagSearch.toLowerCase()) && (
                               <button
                                 onClick={() => handleCreateTag(tagSearch)}
                                 disabled={isCreatingTag}
                                 className="w-full text-left px-4 py-4 bg-[#b50a0a]/5 hover:bg-[#b50a0a] rounded-xl flex items-center justify-between group border border-dashed border-[#b50a0a]/20 transition-all mt-4"
                               >
                                 <span className="text-xs font-bold text-[#b50a0a] group-hover:text-white">Add Tag: &quot;{tagSearch}&quot;</span>
                                 {isCreatingTag ? <Loader2 className="w-4 h-4 animate-spin text-[#b50a0a]" /> : <Plus className="w-4 h-4 text-[#b50a0a] group-hover:text-white" />}
                               </button>
                             )}
                           </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              <div className="space-y-10">
                 <div className="space-y-2">
                    <h4 className="text-xs font-bold text-black tracking-[0.2em] flex items-center gap-2">
                       <ImageIcon className="w-4 h-4 text-[#b50a0a]" />
                       Featured Image
                    </h4>
                    <p className="text-xs text-gray-500 font-bold tracking-wide">Article Cover View</p>
                 </div>

                 <div 
                   onClick={() => {
                     setGalleryUsage('cover');
                     setIsGalleryOpen(true);
                   }}
                   className="aspect-[16/9] bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center p-4 md:p-8 text-center group cursor-pointer hover:border-black/20 hover:shadow-lg transition-all overflow-hidden relative shadow-sm"
                 >
                    {formData.cover_image_url ? (
                       <>
                          <NextImage src={formData.cover_image_url} className="w-full h-full object-cover" alt="Cover" fill />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <p className="text-xs font-bold text-white tracking-wide">Change Visual</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, cover_image_url: '' }); }}
                            className="absolute top-4 right-4 w-9 h-9 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-black hover:bg-black hover:text-white transition-all shadow-xl"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </>
                    ) : (
                       <div className="flex flex-col items-center gap-4">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-black group-hover:text-white transition-all shadow-inner group-hover:scale-110">
                             <Plus className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs font-bold text-black tracking-wide group-hover:text-[#b50a0a] transition-colors">Select from Gallery</p>
                             <p className="text-xs font-bold text-gray-400">Dimensions: 1920x1080 recommended</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* SEO Section: Full Width */}
            <div className="p-4 md:p-8 sm:p-12 space-y-12 border-t border-gray-100 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.02)] mt-24">
               <div className="space-y-2">
                  <h4 className="text-xs font-bold text-black tracking-[0.2em] flex items-center gap-2">
                     <Globe className="w-4 h-4 text-[#b50a0a]" />
                     SEO Meta Settings
                  </h4>
                  <p className="text-xs text-gray-500 font-bold tracking-wide">The algorithm&apos;s perspective</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                     <label className="text-xs font-bold text-black tracking-wide ml-1">Meta Title</label>
                     <input 
                        type="text" 
                        placeholder="SEO hook title..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold text-black focus:ring-4 focus:ring-black/5 shadow-inner transition-all"
                        value={formData.meta_title}
                        onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                     />
                  </div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <label className="text-xs font-bold text-black tracking-wide ml-1">Meta Description</label>
                         <span className="text-xs font-bold text-gray-400 tracking-wide">{formData.meta_description.length}/140</span>
                      </div>
                      <textarea 
                         rows={1}
                         maxLength={140}
                         placeholder="Index page snippet..."
                         className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs font-bold text-black focus:ring-4 focus:ring-black/5 shadow-inner transition-all resize-none overflow-hidden"
                         value={formData.meta_description}
                         onChange={(e) => {
                           setFormData({ ...formData, meta_description: e.target.value });
                           e.target.style.height = "auto";
                           e.target.style.height = e.target.scrollHeight + 'px';
                         }}
                      />
                   </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <MediaGallery 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        onSelect={(url) => {
          if (galleryUsage === 'editor' && editor) {
            editor.chain().focus().setImage({ src: url }).run();
          } else {
            setFormData({ ...formData, cover_image_url: url });
          }
        }}
      />
    </div>
  );
}
