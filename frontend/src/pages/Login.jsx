// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(account, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-orange-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-600">遗脉工坊</h1>
          <p className="text-gray-500 mt-2">AI非遗与古籍活化创作助手</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">账号</label>
            <input
              type="text"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="用户名或邮箱"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="请输入密码"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2.5 rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          还没有账号？<Link to="/register" className="text-primary-600 hover:underline">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
