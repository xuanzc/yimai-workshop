// frontend/src/pages/Create.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { creationApi } from '../services/creation';
import { materialApi } from '../services/material';
import { MATERIAL_TYPES, SCENARIOS, AUDIENCES, AUDIENCE_LABELS, SAMPLE_MATERIAL_PRESETS, SCENARIO_BANNERS, SCENARIO_LABELS, CONTENT_ITEM_ICONS } from '../utils/constants';
import { copyToClipboard, downloadMarkdown } from '../utils/helpers';
import MarkdownView from '../components/CreationResult/MarkdownView';
import CraftGraph from '../components/CraftGraph/CraftGraph';
import { Sparkles, Copy, Download, Loader2, Wand2 } from 'lucide-react';

export default function Create() {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [inputMode, setInputMode] = useState('new'); // 'new' | 'existing'
  const [materialType, setMaterialType] = useState('ancient_book');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [scenario, setScenario] = useState('classroom');
  const [audience, setAudience] = useState('child');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    materialApi.list({ page: 1, page_size: 100 }).then((res) => {
      setMaterials(res.data.items);
      // 如果 URL 携带 materialId，自动切换到"从素材库选"模式并选中
      const materialId = searchParams.get('materialId');
      if (materialId) {
        setInputMode('existing');
        setSelectedMaterialId(materialId);
      }
    });
  }, []);

  const handleGenerate = async () => {
    let matId = selectedMaterialId;
    if (inputMode === 'new') {
      if (!content.trim()) { setToast('请输入素材内容'); return; }
      const matRes = await materialApi.create({ title: title || '未命名素材', material_type: materialType, content });
      matId = matRes.data.id;
    }
    if (!matId) { setToast('请选择或输入素材'); return; }

    setLoading(true);
    setResult(null);
    try {
      const res = await creationApi.create({ material_id: parseInt(matId), scenario, audience });
      setResult(res.data);
      setActiveTab(0);
    } catch (err) {
      setToast(err.detail || '创作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAudience = async (newAudience) => {
    if (!result || loading || result.audience === newAudience) return;
    setLoading(true);
    try {
      const res = await creationApi.switchAudience(result.id, newAudience);
      setResult(res.data);
      setActiveTab(0);
    } catch (err) {
      setToast(err.detail || '切换失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n');
    copyToClipboard(text);
    setToast('已复制到剪贴板');
  };

  const handleExport = () => {
    if (!result) return;
    const text = `# ${result.title}\n\n${result.content_items.map((i) => `## ${i.title}\n\n${i.content}`).join('\n\n')}`;
    downloadMarkdown(`${result.title}.md`, text);
    setToast('已导出 Markdown');
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* 左侧输入区 */}
      <div className="w-full lg:w-2/5 lg:border-r border-gray-200 p-5 md:p-6 overflow-auto bg-white lg:h-full">
        <h1 className="text-xl font-bold text-gray-800 mb-6">开始创作</h1>

        {/* 素材来源 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">素材来源</label>
          <div className="flex gap-2">
            <button onClick={() => setInputMode('new')} className={`flex-1 py-2 text-sm rounded-lg ${inputMode === 'new' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>直接输入</button>
            <button onClick={() => setInputMode('existing')} className={`flex-1 py-2 text-sm rounded-lg ${inputMode === 'existing' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>从素材库选</button>
          </div>
        </div>

        {inputMode === 'existing' ? (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">选择素材</label>
            <select value={selectedMaterialId} onChange={(e) => setSelectedMaterialId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">请选择...</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">素材标题</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="为素材命名" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">素材类型</label>
              <div className="grid grid-cols-2 gap-2">
                {MATERIAL_TYPES.map((t) => (
                  <button key={t.value} onClick={() => setMaterialType(t.value)} className={`py-2 text-sm rounded-lg border ${materialType === t.value ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600'}`}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">素材内容</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="粘贴古籍原文、工艺描述、口述记录或关键词..." className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" />
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1"><Wand2 size={12} /> 快速填入示例素材：</p>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_MATERIAL_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTitle(preset.title);
                        setMaterialType(preset.material_type);
                        setContent(preset.content);
                      }}
                      className="text-xs px-2.5 py-1 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 border border-primary-100"
                    >
                      {MATERIAL_TYPES.find((t) => t.value === preset.material_type)?.icon} {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 场景选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">使用场景</label>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map((s) => (
              <button key={s.value} onClick={() => setScenario(s.value)} className={`p-3 text-left rounded-lg border ${scenario === s.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                <div className="text-sm font-medium">{s.icon} {s.label}</div>
                <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 受众选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">目标受众</label>
          <div className="flex gap-2">
            {AUDIENCES.map((a) => (
              <button key={a.value} onClick={() => setAudience(a.value)} className={`flex-1 py-2 text-sm rounded-lg ${audience === a.value ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={18} /> 创作中...</> : <><Sparkles size={18} /> 生成内容</>}
        </button>
      </div>

      {/* 右侧结果区 */}
      <div className="flex-1 p-5 md:p-6 overflow-auto bg-gray-50">
        {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

        {!result && !loading && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-20">📜</div>
              <p className="text-lg font-medium text-gray-400 mb-1">AI 创作工作台</p>
              <p className="text-sm text-gray-400">选择素材和场景后，点击"生成内容"开始创作</p>
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-300">
                <span className="flex items-center gap-1">📚 教案</span>
                <span className="flex items-center gap-1">🏛️ 展板</span>
                <span className="flex items-center gap-1">🎬 分镜</span>
                <span className="flex items-center gap-1">🎒 研学</span>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-primary-100"></div>
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
                  {SCENARIOS.find((s) => s.value === scenario)?.icon}
                </div>
              </div>
              <p className="text-gray-500 font-medium">AI 正在创作中...</p>
              <p className="text-xs text-gray-400 mt-1">解析素材 · 生成内容 · 构建图谱</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="max-w-4xl mx-auto">
            {/* 场景横幅图 */}
            <div className="relative rounded-2xl overflow-hidden mb-5 shadow-md">
              <img src={SCENARIO_BANNERS[result.scenario]} alt={SCENARIO_LABELS[result.scenario]} className="w-full h-40 object-cover" />
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
                <h2 className="text-xl font-bold text-white drop-shadow-lg">{result.title}</h2>
              </div>
            </div>

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
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Copy size={14} /> 复制
                </button>
                <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>

            {/* 受众切换 */}
            <div className="flex items-center gap-2 mb-5 bg-white rounded-xl p-3 shadow-sm">
              <span className="text-sm text-gray-500 mr-1">受众切换：</span>
              {AUDIENCES.map((a) => (
                <button key={a.value} onClick={() => handleSwitchAudience(a.value)} disabled={loading} className={`px-3 py-1.5 text-sm rounded-lg transition disabled:opacity-50 ${result.audience === a.value ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {a.label}
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
        )}
      </div>
    </div>
  );
}
