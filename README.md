# 遗脉工坊 — AI非遗与古籍活化创作助手

一款基于大模型驱动的 Web AI 创作系统，上传古籍、非遗素材即可一键生成多场景文化传播内容包。

## 功能特性

- **四类素材输入**：古籍原文、非遗工艺文字、口述记录、工艺关键词
- **四大场景输出**：课堂教学、展馆展览、短视频宣传、研学活动
- **四种受众切换**：儿童、青少年、成人、专家
- **工艺流程图谱可视化**
- **Mock/真实 AI 双模式**（默认 Mock 可直接演示）
- **用户体系**：注册登录、个人中心、创作历史

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + Tailwind CSS + Zustand |
| 后端 | FastAPI + SQLAlchemy + SQLite |
| AI | 多模型适配层（Mock / OpenAI / 通义千问） |
| 认证 | JWT Token |

## 项目结构

```
遗脉工坊/
├── frontend/          # 前端项目 (React + Vite)
├── backend/           # 后端项目 (FastAPI)
│   ├── app/
│   │   ├── api/       # API 路由
│   │   ├── core/      # 配置、数据库、安全
│   │   ├── models/    # 数据模型
│   │   ├── schemas/   # Pydantic 模式
│   │   ├── services/  # 业务逻辑
│   │   └── ai/        # AI 适配层
│   └── tests/         # 测试
├── spec.md            # 产品规格说明书
└── plan.md            # 实施计划
```

## 快速开始

### 后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python run.py
# 服务运行在 http://localhost:8000
# API 文档：http://localhost:8000/docs
```

### 前端

```bash
cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

### 配置真实 AI（可选）

编辑 `backend/.env`：

```env
AI_PROVIDER=openai          # mock | openai | qwen
AI_API_KEY=your-api-key
AI_MODEL=gpt-4o-mini
```

## 默认 Mock 模式

无需配置 API Key，默认 Mock 模式可直接体验全部功能。

## 运行测试

```bash
cd backend
python -m pytest tests/ -v --asyncio-mode=auto
```

## API 文档

启动后端后访问 [http://localhost:8000/docs](http://localhost:8000/docs) 查看 Swagger 文档。

## License

MIT
