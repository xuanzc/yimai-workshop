// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">注册账号</h1>
          <p className="text-gray-500 mt-2">加入遗脉工坊，激活传统文化</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={form.username} onChange={update('username')} placeholder="用户名" required minLength={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <input type="email" value={form.email} onChange={update('email')} placeholder="邮箱" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <input type="password" value={form.password} onChange={update('password')} placeholder="密码 (至少6位)" required minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <input type="password" value={form.confirm} onChange={update('confirm')} placeholder="确认密码" required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 transition disabled:opacity-50">
            {loading ? '注册中...' : '注 册'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？<Link to="/login" className="text-primary-600 hover:underline">返回登录</Link>
        </p>
      </div>
    </div>
  );
}
