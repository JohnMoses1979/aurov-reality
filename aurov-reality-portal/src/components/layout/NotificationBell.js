import { useEffect, useMemo, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { notificationApi } from '../../services/api.js';

function formatDateTime(value) {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await notificationApi.getMy();
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount || 0));
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();

    const timer = window.setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => window.clearInterval(timer);
  }, []);

  const visibleNotifications = useMemo(() => notifications.slice(0, 12), [notifications]);

  const markRead = async (item) => {
    if (!item || item.read) {
      return;
    }

    try {
      await notificationApi.markRead(item.id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        )
      );
      setUnreadCount((count) => Math.max(count - 1, 0));
    } catch {
      // Keep the existing list if marking read fails.
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true, readAt: item.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // Ignore and preserve current state.
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-2xl border border-slate-200 bg-white p-3 text-slate-700"
        aria-label="Open notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#12B76A] px-1 text-[10px] font-black text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(380px,88vw)] overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/12">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <p className="text-sm font-black text-slate-900">Notifications</p>
              <p className="text-xs font-bold text-slate-500">Unread count decreases when you read an item.</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-black text-slate-600 hover:bg-slate-50"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto p-2">
            {visibleNotifications.length === 0 ? (
              <p className="p-4 text-sm font-bold text-slate-500">No notifications yet.</p>
            ) : (
              visibleNotifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => markRead(item)}
                  className={`w-full rounded-2xl p-3 text-left transition hover:bg-slate-50 ${
                    item.read ? 'opacity-80' : 'bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-wider text-[#0B7A8F]">{item.type || 'Update'}</p>
                    {!item.read && (
                      <span className="rounded-full bg-[#12B76A]/10 px-2 py-1 text-[10px] font-black uppercase text-[#12B76A]">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-extrabold leading-5 text-slate-800">{item.title}</p>
                  {item.message && (
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.message}</p>
                  )}
                  <p className="mt-2 text-[11px] font-semibold text-slate-400">{formatDateTime(item.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
