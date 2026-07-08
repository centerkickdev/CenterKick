import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertTriangle, Clock, MapPin, User, Activity, AlertCircle } from 'lucide-react';

export default async function AdminSystemErrorsPage() {
  const supabase = await createClient();

  // Verify superadmin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: userRecord } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRecord?.role !== 'superadmin') {
    redirect('/admin');
  }

  // Fetch error logs
  const { data: logs, error } = await supabase
    .from('system_error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tighter">
            System <span className="text-[#b50a0a]">Error Logs</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 tracking-wide mt-2">
            Real-time global error tracking and monitoring
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 border border-red-100 rounded-[40px] flex items-center gap-4 text-red-600">
          <AlertCircle className="w-8 h-8" />
          <div>
            <h3 className="font-bold text-base tracking-wide">Failed to load logs</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="p-12 bg-white rounded-[40px] border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tighter mb-2">System Healthy</h3>
          <p className="text-sm font-bold text-gray-400 tracking-wide">No errors have been recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full pb-4 custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-wide whitespace-nowrap">Time</th>
                  <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-wide whitespace-nowrap">User</th>
                  <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-wide whitespace-nowrap">Error</th>
                  <th className="px-4 md:px-8 py-5 text-xs font-bold text-gray-400 tracking-wide whitespace-nowrap">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 md:px-8 py-6 align-top">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 tracking-wide">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <User className="w-3 h-3 text-gray-400" />
                          {log.user_email || 'Anonymous'}
                        </div>
                        {log.ip_address && (
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {log.ip_address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 align-top max-w-md">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-[#b50a0a] shrink-0 mt-0.5" />
                        <div className="space-y-2 w-full">
                          <p className="text-sm font-bold text-[#b50a0a] leading-relaxed break-words">
                            {log.error_message}
                          </p>
                          {log.stack_trace && (
                            <details className="group/details mt-2">
                              <summary className="text-xs font-bold tracking-wide text-gray-400 hover:text-gray-900 cursor-pointer list-none flex items-center gap-1 transition-colors">
                                <span className="group-open/details:hidden">View Stack Trace</span>
                                <span className="hidden group-open/details:inline">Hide Stack Trace</span>
                              </summary>
                              <pre className="mt-2 p-4 bg-gray-900 text-red-400 rounded-2xl text-xs font-mono overflow-auto max-h-40 break-all whitespace-pre-wrap shadow-inner border border-gray-800">
                                {log.stack_trace}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-6 align-top text-sm text-gray-500 font-medium">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2 font-bold text-gray-900 text-xs tracking-wide">
                          <Activity className="w-3 h-3 text-[#b50a0a]" />
                          {log.activity_context || 'N/A'}
                        </p>
                        {log.page_url && (
                          <p className="text-xs text-gray-400 truncate max-w-full max-w-[200px]" title={log.page_url}>
                            {log.page_url}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
