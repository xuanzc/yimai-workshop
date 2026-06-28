// frontend/src/pages/CreationDetail.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { creationApi } from '../services/creation';
import { AUDIENCES } from '../utils/constants';
import { copyToClipboard, downloadMarkdown } from '../utils/helpers';
import MarkdownView from '../components/CreationResult/MarkdownView';
import CraftGraph from '../components/CraftGraph/CraftGraph';
import { Copy, Download, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    creationApi.get(id).then((res) => {
      setResult(res.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSwitchAudience = async (newAudience) => {
    setSwitching(true);
    try {
      const res = await creationApi.switchAudience(result.id, newAudience);
      setResult(res.data);
      setActiveTab(0);
      navigate(`/history/${res.data.id}`);
    } catch (err) {
      setToast('切换失败');
    } finally {
      setSwitching(false);
    }
  };

  const handleCopy = () => {
    const text = result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n');
    copyToClipboard(text);
    setToast('已复制');
  };

  const handleExport = () => {
    const text = `# ${result.title}\n\n${result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n')}`;
    downloadMarkdown(`${result.title}.md`, text);
    setToast('已导出');
  };

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (!result) return <div className="p-8 text-gray-500">创作不存在</div>;

  return (
    <div className="p-8">
      {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

      <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> 返回列表
      </button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">{result.title}</h1>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"><Copy size={14} /> 复制</button>
          <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"><Download size={14} /> 导出</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <span className="text-sm text-gray-500 py-1.5">受众切换：</span>
        {AUDIENCES.map((a) => (
          <button key={a.value} onClick={() => handleSwitchAudience(a.value)} disabled={switching} className={`px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 ${result.audience === a.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>
            {switching ? <Loader2 className="animate-spin inline" size={14} /> : a.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {result.content_items.map((item, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2 text-sm border-b-2 ${activeTab === i ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`}>{item.title}</button>
        ))}
      </div>

      {result.content_items[activeTab] && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
          <MarkdownView content={result.content_items[activeTab].content} />
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4">工艺流程图谱</h3>
        <CraftGraph nodes={result.craft_graph.nodes} edges={result.craft_graph.edges} />
      </div>
    </div>
  );
}
