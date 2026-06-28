// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/user';
import { creationApi } from '../services/creation';
import { SCENARIO_LABELS, SCENARIOS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { useAuthStore } from '../store/authStore';
import { Sparkles, FolderOpen, FileText, TrendingUp } from 'lucide-react';

const SCENARIO_COLORS = {
  classroom: 'bg-blue-500',
  exhibition: 'bg-purple-500',
  video: 'bg-pink-500',
  study_tour: 'bg-green-500',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
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

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>)}
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
  const totalCreations = stats.creation_count || 0;
  const maxCount = Math.max(...Object.values(stats.scenario_distribution), 1);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* 欢迎卡片 */}
      <div className="bg-gradient-to-r from-primary-500 to-orange-400 rounded-2xl p-6 mb-6 text-white shadow-md">
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          {greeting}，{user?.username || '创作者'} 👋
        </h1>
        <p className="text-primary-50 text-sm">欢迎回到遗脉工坊，今天想创作什么内容？</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate('/create')} className="bg-white text-primary-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition flex items-center gap-1.5">
            <Sparkles size={16} /> 开始创作
          </button>
          <button onClick={() => navigate('/materials')} className="bg-white/20 text-white px-5 py-2 rounded-lg text-sm backdrop-blur-sm hover:bg-white/30 transition flex items-center gap-1.5">
            <FolderOpen size={16} /> 素材库
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FolderOpen className="text-blue-500" size={20} />
            </div>
            <span className="text-gray-500 text-sm">素材总数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.material_count}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Sparkles className="text-primary-500" size={20} />
            </div>
            <span className="text-gray-500 text-sm">创作总数</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.creation_count}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="text-green-500" size={20} />
            </div>
            <span className="text-gray-500 text-sm">场景覆盖</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{Object.keys(stats.scenario_distribution).length}<span className="text-base text-gray-400">/4</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 场景分布可视化 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <h2 className="font-bold text-gray-800 mb-4 text-sm">创作场景分布</h2>
          {totalCreations === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">暂无数据</div>
          ) : (
            <div className="space-y-3">
              {SCENARIOS.map((s) => {
                const count = stats.scenario_distribution[s.value] || 0;
                const pct = totalCreations > 0 ? (count / totalCreations) * 100 : 0;
                return (
                  <div key={s.value}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600">{s.icon} {s.label}</span>
                      <span className="text-gray-400">{count} 篇 ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${SCENARIO_COLORS[s.value]} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 最近创作 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 text-sm">最近创作</h2>
            <button onClick={() => navigate('/history')} className="text-xs text-primary-500 hover:text-primary-600">查看全部 →</button>
          </div>
          {recent.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              暂无创作记录<br/>
              <button onClick={() => navigate('/create')} className="text-primary-500 hover:underline mt-1">开始第一次创作</button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(`/history/${item.id}`)}>
                  <div className={`w-1 h-10 rounded-full ${SCENARIO_COLORS[item.scenario] || 'bg-gray-300'}`}></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">{item.title}</h3>
                    <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{SCENARIO_LABELS[item.scenario]}</span>
                      <span>·</span>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
