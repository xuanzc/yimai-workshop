// frontend/src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ensureDemoData, getDemoCredentials, isMockMode } from '../services/mockBackend';

const DEMO_ACCOUNT = 'demo';
const DEMO_PASSWORD = 'demo123';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [account, setAccount] = useState(DEMO_ACCOUNT);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 确保演示数据已初始化
  useEffect(() => {
    if (isMockMode()) ensureDemoData();
  }, []);

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

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    // 确保 mock 数据已初始化
    if (isMockMode()) ensureDemoData();
    try {
      const cred = isMockMode() ? getDemoCredentials() : { account: DEMO_ACCOUNT, password: DEMO_PASSWORD };
      await login(cred.account, cred.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || err.message || '演示登录失败');
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
        {/* 演示账号快捷入口（所有模式均显示） */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-orange-50 text-orange-600 border border-orange-200 py-2.5 rounded-lg hover:bg-orange-100 transition disabled:opacity-50 text-sm font-medium"
          >
            体验演示账号（已含样例素材）
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">演示账号：demo / demo123</p>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          还没有账号？<Link to="/register" className="text-primary-600 hover:underline">立即注册</Link>
        </p>
      </div>
    </div>
  );
}
