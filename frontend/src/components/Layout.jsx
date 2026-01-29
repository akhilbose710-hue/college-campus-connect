import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  BarChart3,
  Shield,
  Monitor,
  BookOpen,
  CalendarDays,
  FileClock,
  FileText,
  ClipboardList,
  LogOut
} from 'lucide-react';
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
export default function Layout() {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();
  const primaryRole = roles[0];
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/reports', label: 'Reports', icon: BarChart3 }
  ];
  if (roles.includes('SUPER_ADMIN') || roles.includes('IT_ADMIN')) {
    navItems.push({ to: '/admin', label: 'Admin', icon: Shield });
    navItems.push({ to: '/devices', label: 'Devices', icon: Monitor });
  }
  if (roles.includes('STUDENT')) {
    navItems.push({ to: '/my-courses', label: 'My Courses', icon: BookOpen });
    navItems.push({ to: '/schedule', label: 'Class Schedules', icon: CalendarDays });
    navItems.push({ to: '/leave', label: 'Leave Applications', icon: FileClock });
    navItems.push({ to: '/forms', label: 'Forms & Certs', icon: FileText });
    navItems.push({ to: '/survey', label: 'Activity Survey', icon: ClipboardList });
  }
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate('/login');
    }
  };
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white/80 px-4 py-6 md:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-md text-white">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">Campus Connect</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{primaryRole || 'User'}</div>
          </div>
        </div>
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                classNames(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={`transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-7 w-7 rounded-lg bg-primary-600" />
            <span className="text-sm font-semibold text-slate-900">Campus Connect</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="text-right text-xs">
              <div className="font-semibold text-slate-900">{user?.user_metadata?.full_name || user?.name || user?.email}</div>
              <div className="text-slate-500">{primaryRole}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 bg-white/60 px-4 py-3 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Campus Connect</span>
          <span className="mx-2">·</span>
          <Link to="/privacy" className="hover:text-slate-700">
            Privacy
          </Link>
        </footer>
      </div>
    </div>
  );
}