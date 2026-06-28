// frontend/src/pages/History.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { creationApi } from '../services/creation';
import { SCENARIOS, SCENARIO_LABELS, AUDIENCE_LABELS } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { Trash2, Eye, Search } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [scenario, setScenario] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    creationApi.list({ page, page_size: 10, scenario: scenario || undefined }).then((res) => {
      let filtered = res.data.items;
      if (searchTerm) {
        filtered = filtered.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setItems(filtered);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, scenario]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!confirm('确认删除？')) return;
    await creationApi.delete(id);
    fetchData();
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">历史记录</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => { setScenario(''); setPage(1); }} className={`px-4 py-1.5 text-sm rounded-lg whitespace-nowrap ${!scenario ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>全部</button>
          {SCENARIOS.map((s) => (
            <button key={s.value} onClick={() => { setScenario(s.value); setPage(1); }} className={`px-4 py-1.5 text-sm rounded-lg whitespace-nowrap ${scenario === s.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>{s.label}</button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="relative flex-shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索创作标题..."
            className="w-full sm:w-64 pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>
      </div>

      {loading ? <div className="text-gray-500">加载中...</div> : items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">暂无创作记录</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/history/${item.id}`)}>
                <h3 className="font-medium text-gray-800">{item.title}</h3>
                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                  <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded">{SCENARIO_LABELS[item.scenario]}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">受众: {AUDIENCE_LABELS[item.audience]}</span>
                  {item.material_title && <span>素材: {item.material_title}</span>}
                  <span>{formatDate(item.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => navigate(`/history/${item.id}`)} className="p-2 text-gray-400 hover:text-primary-600"><Eye size={16} /></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 text-sm rounded ${page === i + 1 ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
