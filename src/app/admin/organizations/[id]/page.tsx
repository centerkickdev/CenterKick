import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Building2, Mail, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface OrganizationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: org, error } = await supabase
    .from('profiles')
    .select('*, users!user_id(role, email)')
    .eq('id', id)
    .single();

  if (error || !org) {
    return notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations" className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold tracking-wide hover:bg-gray-50 transition-all">
          &larr; Back
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tighter leading-none">
          Organization <span className="text-[#b50a0a]">Profile</span>
        </h1>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 rounded-3xl bg-gray-900 flex items-center justify-center text-white text-4xl font-bold shadow-xl shrink-0 overflow-hidden border-4 border-white">
            {org.avatar_url ? (
               <img src={org.avatar_url} alt={org.first_name} className="w-full h-full object-cover" />
            ) : (
               <Building2 className="w-12 h-12 text-gray-500" />
            )}
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tighter leading-none mb-2">
                {org.first_name} {org.last_name}
              </h2>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500 tracking-wide">
                  <Mail className="w-3.5 h-3.5" />
                  {org.email || org.users?.email || 'N/A'}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500 tracking-wide">
                  <MapPin className="w-3.5 h-3.5" />
                  {org.country || org.nationality || 'Unspecified Location'}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-bold text-gray-500 tracking-wide">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {format(new Date(org.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {org.status === 'active' ? (
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 text-xs font-bold tracking-wide border border-green-100">
                  <CheckCircle className="w-4 h-4" />
                  Verified Active
                </div>
              ) : (
                <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl flex items-center gap-2 text-xs font-bold tracking-wide border border-amber-100">
                  <Clock className="w-4 h-4" />
                  Pending Verification
                </div>
              )}
              <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold tracking-wide border border-gray-200">
                ID: {org.id.split('-')[0]}
              </div>
            </div>

            {org.bio && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-900 tracking-wide mb-2">About Organization</h3>
                <p className="text-base text-gray-600 leading-relaxed max-w-3xl">
                  {org.bio}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
