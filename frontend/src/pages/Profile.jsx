// frontend/src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../services/user';
import { SCENARIO_LABELS } from '../utils/constants';

export default function Profile() {
  const { user, fetchUser } = useAuthStore();
  const [form, setForm] = useState({ username: '', avatar: '' });
  const [pwdForm, setPwdForm] = useState({ old_password: '', new_password: '' });
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (user) setForm({ username: user.username, avatar: user.avatar || '' });
    userApi.getStats().then((res) => setStats(res.data));
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await userApi.updateProfile(form);
      await fetchUser();
      setToast('个人信息更新成功');
    } catch (err) {
      setToast(err.detail || '更新失败');
    }
  };

  const handleUpdatePassword = async () => {
    try {
      await userApi.updatePassword(pwdForm);
      setPwdForm({ old_password: '', new_password: '' });
      setToast('密码修改成功');
    } catch (err) {
      setToast(err.detail || '修改失败');
    }
  };

  return (
    <div className="p-8 max-w-3xl">
      {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">个人中心</h1>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.material_count}</p>
            <p className="text-sm text-gray-500">素材数</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary-600">{stats.creation_count}</p>
            <p className="text-sm text-gray-500">创作数</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-primary-600">{Object.keys(stats.scenario_distribution).length}</p>
            <p className="text-sm text-gray-500">场景覆盖</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className="font-bold text-gray-800 mb-4">个人信息</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">用户名</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">邮箱</label>
            <input value={user?.email || ''} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">头像 URL</label>
            <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <button onClick={handleUpdateProfile} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">保存修改</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">修改密码</h2>
        <div className="space-y-4">
          <input type="password" value={pwdForm.old_password} onChange={(e) => setPwdForm({ ...pwdForm, old_password: e.target.value })} placeholder="原密码" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <input type="password" value={pwdForm.new_password} onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })} placeholder="新密码 (至少6位)" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          <button onClick={handleUpdatePassword} className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">修改密码</button>
        </div>
      </div>
    </div>
  );
}
