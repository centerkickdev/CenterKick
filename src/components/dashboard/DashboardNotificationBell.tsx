'use client';

import { useState } from 'react';
import { Bell, Check, ExternalLink, Info, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export function DashboardNotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    // In a real implementation we'd call a server action here. 
    // We update UI optimistically for now to fulfill fast-launch requirements.
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
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
        className="p-2 text-gray-400 hover:text-[#b50a0a] transition-all relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#b50a0a] rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-200">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Notifications</h3>
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

            <div className="max-h-[60vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs font-bold text-gray-400 tracking-wide">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-5 transition-all hover:bg-gray-50/50 group relative ${!notif.is_read ? 'bg-red-50/10' : ''}`}
                    >
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#b50a0a]"></div>
                      )}
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-50">
                          {getTypeIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-xs font-bold tracking-tight ${!notif.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                             {notif.title}
                          </h4>
                          <p className={`text-xs mt-1 leading-relaxed ${!notif.is_read ? 'text-gray-600' : 'text-gray-400'}`}>
                             {notif.message}
                          </p>
                          
                          <div className="mt-3 flex items-center gap-3">
                             {notif.action_url && (
                               <Link 
                                 href={notif.action_url}
                                 onClick={() => setIsOpen(false)}
                                 className="text-xs font-bold text-[#b50a0a] hover:underline"
                               >
                                  View Details
                               </Link>
                             )}
                             {!notif.is_read && (
                               <button 
                                 onClick={() => handleMarkRead(notif.id)}
                                 className="text-xs font-bold text-gray-400 hover:text-black"
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
          </div>
        </>
      )}
    </div>
  );
}
