// frontend/src/pages/CreationDetail.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { creationApi } from '../services/creation';
import { AUDIENCES, AUDIENCE_LABELS, SCENARIO_BANNERS, SCENARIO_LABELS, SCENARIOS, CONTENT_ITEM_ICONS, MATERIAL_TYPES, MATERIAL_IMAGES } from '../utils/constants';
import { materialApi } from '../services/material';
import { copyToClipboard, downloadMarkdown } from '../utils/helpers';
import MarkdownView from '../components/CreationResult/MarkdownView';
import CraftGraph from '../components/CraftGraph/CraftGraph';
import { Copy, Download, Loader2, ArrowLeft } from 'lucide-react';

export default function CreationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [switching, setSwitching] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    creationApi.get(id).then((res) => {
      setResult(res.data);
      // 获取关联的原始素材
      if (res.data.material_id) {
        materialApi.get(res.data.material_id).then((matRes) => {
          setMaterial(matRes.data);
        }).catch(() => {});
      }
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
    let text = `# ${result.title}\n\n`;
    if (material) {
      const typeLabel = MATERIAL_TYPES.find((t) => t.value === material.material_type)?.label || material.material_type;
      text += `## 原始素材\n\n**标题：** ${material.title}\n**类型：** ${typeLabel}\n\n${material.content}\n\n`;
    }
    text += result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n');
    if (result.craft_graph && result.craft_graph.nodes.length > 0) {
      text += '\n\n## 工艺流程图谱\n\n';
      text += result.craft_graph.nodes.map((n, i) => `${i + 1}. **${n.label}** (${n.node_type}) — ${n.description || ''}`).join('\n');
      text += '\n\n**流转关系：**\n';
      text += result.craft_graph.edges.map((e) => {
        const s = result.craft_graph.nodes.find((n) => n.node_id === e.source_node);
        const t = result.craft_graph.nodes.find((n) => n.node_id === e.target_node);
        return `- ${s?.label || e.source_node} —${e.label || '→'}→ ${t?.label || e.target_node}`;
      }).join('\n');
    }
    downloadMarkdown(`${result.title}.md`, text);
    setToast('已导出');
  };

  if (loading) return <div className="p-8 text-gray-500">加载中...</div>;
  if (!result) return <div className="p-8 text-gray-500">创作不存在</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

      <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> 返回列表
      </button>

      {/* 场景横幅图 */}
      <div className="relative rounded-2xl overflow-hidden mb-5 shadow-md">
        <img src={SCENARIO_BANNERS[result.scenario]} alt={SCENARIO_LABELS[result.scenario]} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full font-medium">
              {SCENARIOS.find((s) => s.value === result.scenario)?.icon} {SCENARIO_LABELS[result.scenario]}
            </span>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {AUDIENCE_LABELS[result.audience]}版
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">{result.title}</h1>
        </div>
      </div>

      {/* 原始素材展示区 */}
      {material && (
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{MATERIAL_TYPES.find((t) => t.value === material.material_type)?.icon || '📄'}</span>
            <h3 className="text-sm font-bold text-gray-700">原始素材</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{MATERIAL_TYPES.find((t) => t.value === material.material_type)?.label || material.material_type}</span>
          </div>
          <div className="flex gap-4">
            {MATERIAL_IMAGES[material.material_type] && (
              <img src={MATERIAL_IMAGES[material.material_type]} alt={material.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 mb-1">{material.title}</p>
              <p className="text-xs text-gray-500 line-clamp-4 leading-relaxed">{material.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            创作完成
          </span>
          <span>·</span>
          <span>{result.content_items.length} 个内容模块</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"><Copy size={14} /> 复制</button>
          <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"><Download size={14} /> 导出</button>
        </div>
      </div>

      {/* 受众切换 */}
      <div className="flex items-center gap-2 mb-5 bg-white rounded-xl p-3 shadow-sm">
        <span className="text-sm text-gray-500 mr-1">受众切换：</span>
        {AUDIENCES.map((a) => (
          <button key={a.value} onClick={() => handleSwitchAudience(a.value)} disabled={switching} className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${result.audience === a.value ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {switching ? <Loader2 className="animate-spin inline" size={14} /> : a.label}
          </button>
        ))}
      </div>

      {/* 内容标签页 */}
      <div className="flex gap-1 mb-4 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto">
        {result.content_items.map((item, i) => (
          <button key={i} onClick={() => setActiveTab(i)} className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg whitespace-nowrap transition ${activeTab === i ? 'bg-primary-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
            <span>{CONTENT_ITEM_ICONS[item.item_type] || '📄'}</span>
            {item.title}
          </button>
        ))}
      </div>

      {/* 内容展示 */}
      {result.content_items[activeTab] && (
        <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-50">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
            <span className="text-2xl">{CONTENT_ITEM_ICONS[result.content_items[activeTab].item_type] || '📄'}</span>
            <h3 className="text-lg font-bold text-gray-800">{result.content_items[activeTab].title}</h3>
          </div>
          <MarkdownView content={result.content_items[activeTab].content} />
        </div>
      )}

      {/* 工艺图谱 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-50">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">🔧</span>
          <div>
            <h3 className="font-bold text-gray-800">工艺流程图谱</h3>
            <p className="text-xs text-gray-400">从素材中提取的工艺步骤可视化</p>
          </div>
        </div>
        <CraftGraph nodes={result.craft_graph.nodes} edges={result.craft_graph.edges} />
      </div>
    </div>
  );
}
