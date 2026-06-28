// frontend/src/pages/MaterialLib.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { materialApi } from '../services/material';
import { MATERIAL_TYPES, MATERIAL_IMAGES } from '../utils/constants';
import { formatDate, truncate } from '../utils/helpers';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';

export default function MaterialLib() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', material_type: 'ancient_book', content: '' });

  const fetchData = () => {
    materialApi.list({ page, page_size: 12, material_type: type || undefined }).then((res) => {
      setItems(res.data.items);
      setTotal(res.data.total);
    });
  };

  useEffect(() => { fetchData(); }, [page, type]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    if (editing) {
      await materialApi.update(editing.id, form);
    } else {
      await materialApi.create(form);
    }
    setShowModal(false);
    setEditing(null);
    setForm({ title: '', material_type: 'ancient_book', content: '' });
    fetchData();
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({ title: item.title, material_type: item.material_type, content: item.content });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('确认删除？')) return;
    await materialApi.delete(id);
    fetchData();
  };

  const typeLabel = (val) => MATERIAL_TYPES.find((t) => t.value === val)?.label || val;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">素材库</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', material_type: 'ancient_book', content: '' }); setShowModal(true); }} className="flex items-center gap-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          <Plus size={16} /> 新建素材
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setType('')} className={`px-4 py-1.5 text-sm rounded-lg ${!type ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>全部</button>
        {MATERIAL_TYPES.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)} className={`px-4 py-1.5 text-sm rounded-lg ${type === t.value ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300'}`}>{t.icon} {t.label}</button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">暂无素材，点击"新建素材"添加</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group">
              <div className="relative h-32 overflow-hidden">
                <img src={MATERIAL_IMAGES[item.material_type]} alt={typeLabel(item.material_type)} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-white/90 text-primary-600 px-2 py-0.5 rounded backdrop-blur-sm font-medium">{typeLabel(item.material_type)}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{truncate(item.content, 80)}</p>
                <div className="text-xs text-gray-400 mb-3">{formatDate(item.created_at)}</div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/create?materialId=${item.id}`)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-primary-50 text-primary-600 rounded hover:bg-primary-100 transition"><Sparkles size={12} /> 创作</button>
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-primary-600 transition"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-[500px]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">{editing ? '编辑素材' : '新建素材'}</h2>
            <div className="space-y-4">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="素材标题" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              <select value={form.material_type} onChange={(e) => setForm({ ...form, material_type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {MATERIAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8} placeholder="素材内容" className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">取消</button>
                <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600">保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
