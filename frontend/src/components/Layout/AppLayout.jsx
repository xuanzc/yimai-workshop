// frontend/src/components/Layout/AppLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Sparkles, History, FolderOpen, User, LogOut, Menu } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { path: '/create', label: '开始创作', icon: Sparkles },
  { path: '/history', label: '历史记录', icon: History },
  { path: '/materials', label: '素材库', icon: FolderOpen },
  { path: '/profile', label: '个人中心', icon: User },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, fetchUser, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) fetchUser();
  }, []);

  // 路由切换时关闭移动端菜单
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <span className="text-xl font-bold text-primary-600">遗脉工坊</span>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                active ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-gray-700">{user?.username}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500">
          <LogOut size={16} /> 退出登录
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:block flex-shrink-0">{Sidebar}</div>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)}></div>
          <div className="relative z-10">{Sidebar}</div>
        </div>
      )}

      {/* 移动端顶部栏 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30">
        <button onClick={() => setMobileOpen(true)} className="text-gray-600">
          <Menu size={22} />
        </button>
        <span className="text-lg font-bold text-primary-600">遗脉工坊</span>
        <div className="w-6"></div>
      </div>

      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
