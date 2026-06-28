// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/user';
import { creationApi } from '../services/creation';
import { SCENARIO_LABELS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { Sparkles, FolderOpen, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ material_count: 0, creation_count: 0, scenario_distribution: {} });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userApi.getStats(),
      creationApi.list({ page: 1, page_size: 5 }),
    ]).then(([statsRes, recentRes]) => {
      setStats(statsRes.data);
      setRecent(recentRes.data.items);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">工作台</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="text-primary-500" />
            <span className="text-gray-500">素材总数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.material_count}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-primary-500" />
            <span className="text-gray-500">创作总数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.creation_count}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-primary-500" />
            <span className="text-gray-500">场景分布</span>
          </div>
          <div className="text-sm space-y-1">
            {Object.entries(stats.scenario_distribution).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-600">{SCENARIO_LABELS[k] || k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <button onClick={() => navigate('/create')} className="flex-1 bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2">
          <Sparkles size={18} /> 开始创作
        </button>
        <button onClick={() => navigate('/materials')} className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2">
          <FolderOpen size={18} /> 素材库
        </button>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">最近创作</h2>
        {recent.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">暂无创作记录，点击上方按钮开始创作</div>
        ) : (
          <div className="space-y-3">
            {recent.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/history/${item.id}`)}>
                <div>
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-500 mt-1">
                    <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded">{SCENARIO_LABELS[item.scenario]}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
