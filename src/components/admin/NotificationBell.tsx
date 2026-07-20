'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, ExternalLink, Info, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead } from '@/app/admin/notifications/actions';
import { DateDisplay } from '@/components/common/DateDisplay';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    let channel: any;
    const setupRealtime = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      
      channel = supabase.channel('realtime:admin_notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${data.session.user.id}`
        }, (payload: any) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          const toastType = ['success', 'error', 'warning', 'info'].includes(newNotif.type) ? newNotif.type : 'info';
          showToast(`New Notification: ${newNotif.title}`, toastType as any);
        })
        .subscribe();
    };
    setupRealtime();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [showToast]);

  const handleMarkRead = async (id: string) => {
    const res = await markNotificationRead(id);
    if (res.success) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsRead();
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 text-gray-400 hover:text-[#b50a0a] transition-all relative rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-[#b50a0a] text-white text-xs font-bold border-2 border-white rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-[2rem] shadow-2xl shadow-gray-200/50 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Notifications</h3>
                <p className="text-xs font-bold text-gray-400 tracking-wide mt-0.5">Alerts & System Updates</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-[#b50a0a] hover:text-black tracking-wide flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> Mark All Read
                </button>
              )}
            </div>

            <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                      <Bell className="w-6 h-6 text-gray-200" />
                   </div>
                   <p className="text-xs font-bold text-gray-300 tracking-wide">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-5 transition-all hover:bg-gray-50/50 group relative ${!notif.is_read ? 'bg-red-50/5' : ''}`}
                    >
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b50a0a]"></div>
                      )}
                      
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!notif.is_read ? 'bg-white opacity-100' : 'bg-gray-50 opacity-60'}`}>
                          {getTypeIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                             <h4 className={`text-xs font-bold tracking-tight truncate ${!notif.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                                {notif.title}
                             </h4>
                             <span className="text-xs font-bold text-gray-300 whitespace-nowrap flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <DateDisplay date={notif.created_at} showTime={true} />
                             </span>
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${!notif.is_read ? 'text-gray-600' : 'text-gray-400'}`}>
                             {notif.message}
                          </p>
                          
                          <div className="mt-4 flex items-center gap-3">
                             {notif.link && (
                               <Link 
                                 href={notif.link}
                                 onClick={() => setIsOpen(false)}
                                 className="text-xs font-bold text-[#b50a0a] flex items-center gap-1 border border-[#b50a0a]/20 px-2.5 py-1 rounded-lg hover:bg-[#b50a0a] hover:text-white transition-all tracking-wide"
                               >
                                  View Details <ExternalLink className="w-2.5 h-2.5" />
                               </Link>
                             )}
                             {!notif.is_read && (
                               <button 
                                 onClick={() => handleMarkRead(notif.id)}
                                 className="text-xs font-bold text-gray-400 hover:text-black tracking-wide transition-colors"
                               >
                                  Dismiss
                               </button>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                 <button className="text-xs font-bold text-gray-400 hover:text-[#b50a0a] tracking-wide transition-colors">
                    View Archive
                 </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
