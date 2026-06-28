// frontend/src/pages/Create.jsx
import { useState, useEffect } from 'react';
import { creationApi } from '../services/creation';
import { materialApi } from '../services/material';
import { MATERIAL_TYPES, SCENARIOS, AUDIENCES, AUDIENCE_LABELS, SAMPLE_MATERIAL_PRESETS } from '../utils/constants';
import { copyToClipboard, downloadMarkdown } from '../utils/helpers';
import MarkdownView from '../components/CreationResult/MarkdownView';
import CraftGraph from '../components/CraftGraph/CraftGraph';
import { Sparkles, Copy, Download, Loader2, Wand2 } from 'lucide-react';

export default function Create() {
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
    materialApi.list({ page: 1, page_size: 100 }).then((res) => setMaterials(res.data.items));
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
    if (!result) return;
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
    <div className="flex h-full">
      {/* 左侧输入区 */}
      <div className="w-2/5 border-r border-gray-200 p-6 overflow-auto bg-white">
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
      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        {toast && <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg z-50" onClick={() => setToast('')}>{toast}</div>}

        {!result && !loading && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Sparkles size={48} className="mx-auto mb-4 opacity-30" />
              <p>选择素材和场景后，点击"生成内容"开始创作</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="animate-spin mx-auto mb-4 text-primary-500" size={40} />
              <p className="text-gray-500">AI 正在创作中，请稍候...</p>
            </div>
          </div>
        )}

        {result && !loading && (
          <div>
            {/* 工具栏 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{result.title}</h2>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Copy size={14} /> 复制
                </button>
                <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download size={14} /> 导出
                </button>
              </div>
            </div>

            {/* 受众切换 */}
            <div className="flex gap-2 mb-4">
              <span className="text-sm text-gray-500 py-1.5">受众切换：</span>
              {AUDIENCES.map((a) => (
                <button key={a.value} onClick={() => handleSwitchAudience(a.value)} className={`px-3 py-1.5 text-sm rounded-lg ${result.audience === a.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {a.label}
                </button>
              ))}
            </div>

            {/* 内容标签页 */}
            <div className="flex gap-1 mb-4 border-b border-gray-200">
              {result.content_items.map((item, i) => (
                <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2 text-sm border-b-2 ${activeTab === i ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {item.title}
                </button>
              ))}
            </div>

            {/* 内容展示 */}
            {result.content_items[activeTab] && (
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <MarkdownView content={result.content_items[activeTab].content} />
              </div>
            )}

            {/* 工艺图谱 */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">工艺流程图谱</h3>
              <CraftGraph nodes={result.craft_graph.nodes} edges={result.craft_graph.edges} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
