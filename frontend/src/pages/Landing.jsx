// frontend/src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { SCENARIOS } from '../utils/constants';
import { Sparkles, BookOpen, Upload, Cpu, Download } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const steps = [
    { icon: Upload, title: '输入素材', desc: '古籍原文、工艺文字、口述记录或关键词' },
    { icon: Cpu, title: 'AI 解析', desc: '自动拆解文化核心，提取工艺流程' },
    { icon: Sparkles, title: '多场景生成', desc: '一键产出四大场景配套内容包' },
    { icon: Download, title: '一键导出', desc: '支持复制、导出 Markdown，受众切换' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <nav className="flex items-center justify-between px-8 py-4">
        <span className="text-xl font-bold text-primary-600">遗脉工坊</span>
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          className="bg-primary-500 text-white px-5 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          {isAuthenticated ? '进入工作台' : '开始使用'}
        </button>
      </nav>

      <section className="text-center py-20 px-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          一键激活古籍非遗
        </h1>
        <p className="text-xl text-gray-600 mb-2">让传统文化活起来</p>
        <p className="text-gray-500 max-w-2xl mx-auto mb-8">
          基于 AI 大模型，上传古籍与非遗素材，自动生成适配课堂教学、展馆展览、短视频宣传、研学活动的全套文化传播内容
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
          className="bg-primary-500 text-white px-8 py-3 rounded-lg text-lg hover:bg-primary-600 transition shadow-lg"
        >
          立即体验
        </button>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">四步完成文化内容创作</h2>
        <div className="grid grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <Icon className="text-primary-600" size={28} />
                </div>
                <h3 className="font-medium text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">四大应用场景</h2>
        <div className="grid grid-cols-2 gap-6">
          {SCENARIOS.map((s) => (
            <div key={s.value} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{s.label}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-gray-400 text-sm">
        遗脉工坊 · AI非遗与古籍活化创作助手 · 2026
      </footer>
    </div>
  );
}
