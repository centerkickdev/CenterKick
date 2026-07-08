'use client';

import { useState } from 'react';
import { 
  X, Plus, Trash2, ChevronUp, ChevronDown, 
  Save, Eye, Layout, Type, Image as ImageIcon,
  CheckCircle, Loader2, List
} from 'lucide-react';
import { updatePageLayout, updateSectionContent } from '@/app/admin/manage-ui/actions';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MediaGallery from '@/components/admin/blog/MediaGallery';

function ImageSelectField({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  return (
    <div className="space-y-2">
       <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">{label}</label>
       <div className="flex gap-2">
          <input 
            className="flex-1 bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
            placeholder="Image URL"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          <button 
            type="button" 
            onClick={() => setGalleryOpen(true)}
            className="bg-[#b50a0a]/10 text-[#b50a0a] px-4 rounded-2xl flex items-center justify-center hover:bg-[#b50a0a] hover:text-white transition-all"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
       </div>
       <MediaGallery 
         isOpen={galleryOpen}
         onClose={() => setGalleryOpen(false)}
         onSelect={(url) => { onChange(url); setGalleryOpen(false); }}
       />
    </div>
  );
}

function ArrayEditor({ label, items, onChange, itemTemplate, renderItemForm }: { label: string, items: any[], onChange: (val: any[]) => void, itemTemplate: any, renderItemForm: (item: any, updateField: (k: string, v: any) => void) => React.ReactNode }) {
  const currentItems = items || [];
  
  const addItem = () => {
    onChange([...currentItems, { ...itemTemplate }]);
  };
  
  const removeItem = (index: number) => {
    const newItems = [...currentItems];
    newItems.splice(index, 1);
    onChange(newItems);
  };
  
  const updateItem = (index: number, key: string, value: any) => {
    const newItems = [...currentItems];
    newItems[index] = { ...newItems[index], [key]: value };
    onChange(newItems);
  };
  
  return (
    <div className="space-y-4 border border-gray-100 rounded-3xl p-6 bg-gray-50/50">
      <div className="flex items-center justify-between">
         <label className="text-xs font-bold text-gray-900 tracking-wide">{label}</label>
         <button type="button" onClick={addItem} className="bg-white border border-gray-200 shadow-sm text-gray-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:border-[#b50a0a] hover:text-[#b50a0a] transition-colors">
           <Plus className="w-3 h-3" /> Add Item
         </button>
      </div>
      <div className="space-y-4">
        {currentItems.map((item: any, idx: number) => (
          <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm relative">
             <button type="button" onClick={() => removeItem(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors z-10">
                <Trash2 className="w-4 h-4" />
             </button>
             {renderItemForm(item, (k: string, v: any) => updateItem(idx, k, v))}
          </div>
        ))}
        {currentItems.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No items yet.</p>}
      </div>
    </div>
  );
}

interface Section {
  key: string;
  name: string;
}

interface PageEditorClientProps {
  page: {
    slug: string;
    name: string;
    layout: string[];
  };
  content: any[];
  categories: any[];
}

export default function PageEditorClient({ page, content, categories }: PageEditorClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [layout, setLayout] = useState<string[]>(page.layout);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(layout[0] || null);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...layout];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newLayout.length) return;
    
    [newLayout[index], newLayout[newIndex]] = [newLayout[newIndex], newLayout[index]];
    setLayout(newLayout);
    showToast('Layout updated locally', 'info');
  };

  const saveLayout = async () => {
    setIsSaving(true);
    const res = await updatePageLayout(page.slug, layout);
    if (res.success) {
      showToast('Page layout saved successfully', 'success');
      router.refresh();
    } else {
      showToast(res.error || 'Failed to save layout', 'error');
    }
    setIsSaving(false);
  };

  const getSectionContent = (key: string) => {
    return content.find(c => c.section === key)?.content || {};
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 animate-in fade-in duration-700">
      
      {/* Sidebar: Layout Manager */}
      <div className="lg:w-80 space-y-6">
        <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 sticky top-24">
           <div>
              <Link href="/admin/manage-ui" className="text-xs font-bold text-[#b50a0a] tracking-wide flex items-center gap-2 mb-4 hover:translate-x-1 transition-transform">
                 <ChevronUp className="w-3 h-3 -rotate-90" /> Back to Dashboard
              </Link>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tighter">{page.name}</h2>
              <p className="text-xs font-bold text-gray-900 tracking-wide mt-1">Manage Section Layout</p>
           </div>

           <div className="space-y-3">
              {layout.map((key, index) => (
                <div 
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
 activeSection === key 
 ? 'border-[#b50a0a] bg-red-50/50 shadow-md' 
 : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200'
 }`}
                >
                   <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
 activeSection === key ? 'bg-[#b50a0a] text-white' : 'bg-white text-gray-300'
 }`}>
                         {index + 1}
                      </div>
                      <span className={`text-xs font-bold tracking-wide ${
 activeSection === key ? 'text-gray-900' : 'text-gray-500'
 }`}>{key.replace('_', ' ')}</span>
                   </div>
                   
                   <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                        className="p-1 hover:text-[#b50a0a] text-gray-300 disabled:opacity-30" 
                        disabled={index === 0}
                      >
                         <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                        className="p-1 hover:text-[#b50a0a] text-gray-300 disabled:opacity-30" 
                        disabled={index === layout.length - 1}
                      >
                         <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <button 
             onClick={saveLayout}
             disabled={isSaving}
             className="w-full bg-black text-white py-4 rounded-2xl font-bold text-xs tracking-wide hover:bg-[#b50a0a] transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-200 disabled:opacity-50"
           >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save New Layout
           </button>
        </div>
      </div>

      {/* Main Content: Section Editor */}
      <div className="flex-1 space-y-8">
         {activeSection ? (
           <SectionEditor 
             page={page.slug} 
             section={activeSection} 
             initialContent={getSectionContent(activeSection)} 
             categories={categories}
           />
         ) : (
           <div className="bg-white p-20 rounded-[3.5rem] border border-gray-100 shadow-sm text-center">
              <Layout className="w-20 h-20 text-gray-100 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-gray-900 tracking-tighter">Select a section to edit</h3>
              <p className="text-gray-900 text-xs font-bold tracking-wide mt-2">All changes will be reflected on the live site almost instantly.</p>
           </div>
         )}
      </div>
    </div>
  );
}

function SectionEditor({ page, section, initialContent, categories }: { page: string, section: string, initialContent: any, categories: any[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateSectionContent(page, section, content);
    if (res.success) {
      showToast('Section saved successfully', 'success');
      router.refresh();
    } else {
      showToast(res.error || 'Failed to save section', 'error');
    }
    setIsSaving(false);
  };

  const updateField = (field: string, value: any) => {
    setContent({ ...content, [field]: value });
  };

  return (
    <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-10 animate-in slide-in-from-bottom-4 duration-500">
       <div className="flex items-center justify-between border-b border-gray-50 pb-8">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#b50a0a]">
                <EditIcon keyName={section} />
             </div>
             <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tighter">Editing: {section.replace('_', ' ')}</h3>
                <p className="text-xs font-bold text-gray-900 tracking-wide mt-1">Modify text, visuals, and dynamic connections</p>
             </div>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#b50a0a] text-white px-4 md:px-8 py-3.5 rounded-2xl font-bold text-xs tracking-wide hover:bg-black transition-all flex items-center gap-3 shadow-xl shadow-red-900/10 disabled:opacity-50"
          >
             {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
             Publish Changes
          </button>
       </div>

       <form onSubmit={handleSave} className="space-y-8">
          {Object.keys(renderFields(section, content, updateField, categories, page)).length > 0 ? (
            renderFields(section, content, updateField, categories, page)
          ) : (
            <div className="p-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
               <p className="text-xs font-bold text-gray-900 tracking-wide">No configurable fields for this section yet.</p>
            </div>
          )}
       </form>
    </div>
  );
}

function EditIcon({ keyName }: { keyName: string }) {
  if (keyName.includes('hero')) return <Type className="w-6 h-6" />;
  if (keyName.includes('cta')) return <Loader2 className="w-6 h-6" />;
  if (keyName.includes('testimonials')) return <List className="w-6 h-6" />;
  return <Layout className="w-6 h-6" />;
}

/**
 * Dynamic form renderer based on section key
 */
function renderFields(section: string, content: any, onChange: (f: string, v: any) => void, categories: any[], pageSlug?: string) {
  // Common text input helper
  const TextInput = ({ label, field, placeholder, multiline = false, itemValue, onItemChange }: any) => {
    const val = itemValue !== undefined ? itemValue : content[field];
    const handleChg = onItemChange || ((v: any) => onChange(field, v));
    return (
      <div className="space-y-2">
         <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">{label}</label>
         {multiline ? (
            <textarea 
              rows={4}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300 resize-none"
              placeholder={placeholder}
              value={val || ''}
              onChange={(e) => handleChg(e.target.value)}
            />
         ) : (
            <input 
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black placeholder:text-gray-300"
              placeholder={placeholder}
              value={val || ''}
              onChange={(e) => handleChg(e.target.value)}
            />
         )}
      </div>
    );
  };

  // Common category selector helper
  const CategorySelect = ({ label, field }: any) => (
    <div className="space-y-2">
       <label className="text-xs font-bold text-gray-400 tracking-wide ml-1">{label}</label>
       <select 
         className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-[#b50a0a] transition-all text-black"
         value={content[field] || ''}
         onChange={(e) => onChange(field, e.target.value)}
       >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
       </select>
    </div>
  );

  switch (section) {
    case 'hero':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
           <TextInput label="Hero Title" field="title" placeholder="Platform Newsroom..." />
           <TextInput label="Hero Subtitle" field="subtitle" placeholder="Exclusive updates..." />
           <div className="md:col-span-2">
             <ImageSelectField label="Hero Background Image" value={content['image']} onChange={(v) => onChange('image', v)} />
           </div>
           <div className="md:col-span-2 shadow-sm">
              <CategorySelect label="Featured Post Category" field="category_id" />
           </div>
        </div>
      );
    case 'cta':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-8">
           <TextInput label="CTA Subtitle" field="subtitle" placeholder="Ready to Rise?" />
           <TextInput label="CTA Title" field="title" placeholder="Professional Football Network" />
           <TextInput label="Primary Button Text" field="primaryButtonText" placeholder="Contact Our Agency" />
           <TextInput label="Primary Button Link" field="primaryButtonLink" placeholder="/contact" />
        </div>
      );
    case 'news':
    case 'stories':
    case 'highlights':
      return (
         <div className="space-y-6">
            <TextInput label="Section Title" field="title" placeholder="Section Header..." />
            <CategorySelect label="Blog Category to Display" field="category_id" />
         </div>
      );
    case 'mission':
    case 'vision':
      return (
        <div className="space-y-6">
           <TextInput label="Title" field="title" placeholder="Our Mission..." />
           <TextInput label="Description" field="description" placeholder="To empower footballers..." multiline />
           <ImageSelectField label="Background Image" value={content['image']} onChange={(v) => onChange('image', v)} />
        </div>
      );
    case 'mission-vision':
      const updateMV = (subField: string, key: string, val: any) => {
         const current = content[subField] || {};
         onChange(subField, { ...current, [key]: val });
      };
      return (
        <div className="space-y-12">
           <div className="space-y-6 border border-gray-100 p-6 rounded-3xl bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-900 tracking-wide mb-4">Mission Configuration</h4>
              <TextInput label="Mission Title" field="title" itemValue={(content.mission || {}).title} onItemChange={(v: any) => updateMV('mission', 'title', v)} placeholder="Our Mission..." />
              <TextInput label="Mission Description" field="description" itemValue={(content.mission || {}).description} onItemChange={(v: any) => updateMV('mission', 'description', v)} placeholder="To empower footballers..." multiline />
              <ImageSelectField label="Mission Background Image" value={(content.mission || {}).image} onChange={(v) => updateMV('mission', 'image', v)} />
           </div>
           <div className="space-y-6 border border-gray-100 p-6 rounded-3xl bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-900 tracking-wide mb-4">Vision Configuration</h4>
              <TextInput label="Vision Title" field="title" itemValue={(content.vision || {}).title} onItemChange={(v: any) => updateMV('vision', 'title', v)} placeholder="Our Vision..." />
              <TextInput label="Vision Description" field="description" itemValue={(content.vision || {}).description} onItemChange={(v: any) => updateMV('vision', 'description', v)} placeholder="To become Africa's leading..." multiline />
              <ImageSelectField label="Vision Background Image" value={(content.vision || {}).image} onChange={(v) => updateMV('vision', 'image', v)} />
           </div>
        </div>
      );
    case 'intro':
      return (
        <div className="space-y-6">
           <TextInput label="Intro Description (First sentence will be large, rest will be regular)" field="description" placeholder="CenterKick is..." multiline />
        </div>
      );
    case 'philosophy':
      return (
        <div className="space-y-6">
           <TextInput label="Section Title" field="title" placeholder="Our Philosophy" />
           <TextInput label="Section Subtitle" field="subtitle" placeholder="P.I.I.T.E.P" />
           <ArrayEditor 
              label="Philosophy Items" 
              items={content['items']}
              onChange={(v) => onChange('items', v)}
              itemTemplate={{ title: '', desc: '' }}
              renderItemForm={(item: any, updateField: any) => (
                <div className="space-y-3 pt-4 pr-6">
                   <TextInput label="Item Title" field="title" itemValue={item.title} onItemChange={(v: any) => updateField('title', v)} placeholder="Title" />
                   <TextInput label="Item Description" field="desc" itemValue={item.desc} onItemChange={(v: any) => updateField('desc', v)} placeholder="Description" multiline />
                </div>
              )}
           />
        </div>
      );
    case 'services':
      return (
        <div className="space-y-6">
           <TextInput label="Section Title" field="title" placeholder="WHAT WE DO" />
           <ArrayEditor 
              label="Service Items" 
              items={content['items']}
              onChange={(v) => onChange('items', v)}
              itemTemplate={{ num: '', title: '', desc: '', image: '' }}
              renderItemForm={(item: any, updateField: any) => (
                <div className="space-y-3 pt-4 pr-6">
                   <div className="grid grid-cols-2 gap-3">
                     <TextInput label="Service Number" field="num" itemValue={item.num} onItemChange={(v: any) => updateField('num', v)} placeholder="01" />
                     <TextInput label="Service Title" field="title" itemValue={item.title} onItemChange={(v: any) => updateField('title', v)} placeholder="Title" />
                   </div>
                   <TextInput label="Service Description" field="desc" itemValue={item.desc} onItemChange={(v: any) => updateField('desc', v)} placeholder="Description" multiline />
                   <ImageSelectField label="Service Image" value={item.image} onChange={(v) => updateField('image', v)} />
                </div>
              )}
           />
        </div>
      );
    case 'navbar':
      return (
        <div className="space-y-6">
           <TextInput label="Brand Name" field="brand" placeholder="CenterKick" />
           <p className="text-xs font-bold text-gray-900 tracking-wide mt-4">Navigation links are currently managed via JSON in the database for version 1.</p>
        </div>
      );
    case 'faqs':
      return (
        <div className="space-y-6">
           <ArrayEditor 
              label="Frequently Asked Questions" 
              items={content['faqs']}
              onChange={(v) => onChange('faqs', v)}
              itemTemplate={{ q: '', a: '' }}
              renderItemForm={(item: any, updateField: any) => (
                <div className="space-y-3 pt-4 pr-6">
                   <TextInput label="Question" field="q" itemValue={item.q} onItemChange={(v: any) => updateField('q', v)} placeholder="What is CenterKick?" />
                   <TextInput label="Answer" field="a" itemValue={item.a} onItemChange={(v: any) => updateField('a', v)} placeholder="CenterKick is a football media..." multiline />
                </div>
              )}
           />
        </div>
      );
    case 'footer':
      return (
        <div className="space-y-6">
           <TextInput label="Footer Description" field="description" placeholder="CenterKick is a football media platform..." multiline />
           <p className="text-xs font-bold text-gray-900 tracking-wide mt-4">Columns and social links are managed via JSON in the database for version 1.</p>
        </div>
      );
    case 'about':
      if (pageSlug === 'footer') {
         return (
           <div className="space-y-6">
              <TextInput label="Footer Subtext/Description" field="description" placeholder="CenterKick is a football media platform..." multiline />
           </div>
         );
      }
      return <p className="text-sm text-gray-400">Configuration for {section} is coming soon.</p>;
    case 'links':
      if (pageSlug === 'footer') {
         return (
           <div className="space-y-12">
              <ArrayEditor 
                 label="Quick Links" 
                 items={content['quickLinks']}
                 onChange={(v) => onChange('quickLinks', v)}
                 itemTemplate={{ title: '', url: '' }}
                 renderItemForm={(item: any, updateField: any) => (
                   <div className="grid grid-cols-2 gap-3 pt-4 pr-6">
                      <TextInput label="Link Title" field="title" itemValue={item.title} onItemChange={(v: any) => updateField('title', v)} placeholder="Home" />
                      <TextInput label="Link URL" field="url" itemValue={item.url} onItemChange={(v: any) => updateField('url', v)} placeholder="/" />
                   </div>
                 )}
              />
              <ArrayEditor 
                 label="Services List" 
                 items={content['services']}
                 onChange={(v) => onChange('services', v)}
                 itemTemplate={{ title: '', url: '' }}
                 renderItemForm={(item: any, updateField: any) => (
                   <div className="grid grid-cols-2 gap-3 pt-4 pr-6">
                      <TextInput label="Service Title" field="title" itemValue={item.title} onItemChange={(v: any) => updateField('title', v)} placeholder="Player E-Profiles" />
                      <TextInput label="Service URL (optional)" field="url" itemValue={item.url} onItemChange={(v: any) => updateField('url', v)} placeholder="#" />
                   </div>
                 )}
              />
           </div>
         );
      }
      return <p className="text-sm text-gray-400">Configuration for {section} is coming soon.</p>;
    case 'social':
      if (pageSlug === 'footer') {
         return (
           <div className="space-y-6 p-6 border border-gray-100 rounded-3xl bg-gray-50/50 text-center">
              <h3 className="text-xs font-bold text-gray-900 tracking-wide mb-2">Social Profiles</h3>
              <p className="text-xs text-gray-500 mb-6 max-w-md mx-auto">
                 Social media icons in the footer are automatically synchronized with your global site settings.
              </p>
              <Link href="/admin/settings?tab=Social%20Links" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-xs font-bold tracking-wide hover:bg-[#b50a0a] transition-colors">
                 Manage Social Links
              </Link>
           </div>
         );
      }
      return <p className="text-sm text-gray-400">Configuration for {section} is coming soon.</p>;
    case 'contact':
      if (pageSlug === 'footer') {
         return (
           <div className="space-y-6">
              <TextInput label="Contact Email" field="email" placeholder="info.centerkick@gmail.com" />
              <TextInput label="Phone / WhatsApp" field="phone" placeholder="+234 911 260 0300" />
           </div>
         );
      }
      return <p className="text-sm text-gray-400">Configuration for {section} is coming soon.</p>;
    default:
      return <p className="text-sm text-gray-400">Configuration for {section} is coming soon.</p>;
  }
}
