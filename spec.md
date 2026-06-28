# 遗脉工坊 — 产品规格说明书 (Spec)

> **项目全称：** 遗脉工坊：AI非遗与古籍活化创作助手
> **版本：** v1.0
> **日期：** 2026-06-28
> **交付范围：** 规格说明 + 完整可运行的前后端网站工程

---

## 一、项目概述

### 1.1 产品定位

一款基于大模型驱动的 Web 网页 AI 创作系统。用户上传或输入古籍、非遗素材，系统自动拆解文化核心信息，一键产出适配课堂教学、展馆展览、短视频宣传、研学活动四大场景的多版本、多形式配套内容包。

### 1.2 核心价值

| 价值维度 | 说明 |
|----------|------|
| 效率提升 | 将耗时数天的文化内容策划压缩至 1 分钟自动生成初稿 |
| 门槛降低 | 古文、工艺术语自动转化为儿童、普通游客易懂语言 |
| 形式丰富 | 单次输入即可产出文案、互动问答、分镜脚本、工艺图谱多种形式 |
| 公益价值 | 响应古籍活化、非遗传承公益方向，助力传统文化普及 |

### 1.3 目标用户

- 中小学文史教师
- 县域小型博物馆 / 文旅展馆工作人员
- 非遗传承人
- 研学机构内容运营
- 传统文化短视频创作者

### 1.4 素材输入类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 古籍原文 | 古代典籍的文字段落 | 《天工开物·陶埏》片段 |
| 非遗工艺文字 | 工艺流程的文字描述 | 景德镇制瓷七十二道工序 |
| 口述记录 | 传承人口述的访谈文字 | 老艺人讲述皮影戏传承故事 |
| 工艺关键词 | 简短工艺特征关键词 | "蓝印花布、刻板、染色、晾晒" |

### 1.5 四大输出场景

| 场景 | 输出内容形式 | 受众 |
|------|-------------|------|
| 课堂教学 | 教案大纲、知识点卡片、课堂互动问答、课后作业建议 | 中小学生 |
| 展馆展览 | 展板文案、展品说明牌、语音导览词、参观引导语 | 普通游客 |
| 短视频宣传 | 视频分镜脚本、口播文案、字幕文案、封面建议文案 | 短视频观众 |
| 研学活动 | 研学手册大纲、体验活动设计、研学任务卡、安全须知 | 研学学生 |

---

## 二、技术架构

### 2.1 技术栈

| 层级 | 技术选型 | 版本 | 说明 |
|------|----------|------|------|
| 前端框架 | React | 18.x | 单页应用，组件化开发 |
| 构建工具 | Vite | 5.x | 快速热更新构建 |
| 路由 | React Router | 6.x | 客户端路由 |
| UI 框架 | Tailwind CSS | 3.x | 原子化 CSS |
| 组件库 | shadcn/ui | latest | 基于 Radix UI 的高质量组件 |
| 状态管理 | Zustand | 4.x | 轻量状态管理 |
| HTTP 客户端 | Axios | 1.x | API 请求封装 |
| 后端框架 | FastAPI | 0.110+ | 异步高性能 API 框架 |
| Python | 3.10+ | - | 运行时 |
| ORM | SQLAlchemy | 2.x | 数据库 ORM |
| 数据库 | SQLite | 3.x | 轻量文件型数据库 |
| 数据校验 | Pydantic | 2.x | 请求/响应模型校验 |
| 认证 | JWT (python-jose) | - | 无状态 Token 认证 |
| 密码加密 | passlib[bcrypt] | - | 密码哈希 |
| AI 适配层 | httpx | 0.27+ | 异步 HTTP 调用 AI API |

### 2.2 架构图

```
┌─────────────────────────────────────────────────────┐
│                    浏览器 (Browser)                    │
│  React SPA (Vite dev server :5173 / Nginx :80)       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / JSON
                       ▼
┌─────────────────────────────────────────────────────┐
│              FastAPI Backend (:8000)                  │
│  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │
│  │  Auth    │ │ Material │ │    Creation        │   │
│  │  Router  │ │  Router  │ │    Router          │   │
│  └────┬─────┘ └────┬─────┘ └─────────┬──────────┘   │
│       │            │                 │               │
│  ┌────▼────────────▼─────────────────▼──────────┐   │
│  │            Service Layer (业务逻辑)            │   │
│  │  AuthService / MaterialService / CreationSvc  │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │                              │
│  ┌────────────────────▼─────────────────────────┐   │
│  │            AI Adapter Layer                   │   │
│  │  MockProvider / OpenAIProvider / QwenProvider │   │
│  └────────────────────┬─────────────────────────┘   │
│                       │                              │
│  ┌────────────────────▼─────────────────────────┐   │
│  │         SQLAlchemy ORM → SQLite               │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 2.3 项目目录结构

```
遗脉工坊/
├── frontend/                     # 前端项目
│   ├── public/
│   ├── src/
│   │   ├── components/           # 通用组件
│   │   │   ├── ui/              # shadcn/ui 组件
│   │   │   ├── Layout/          # 布局组件
│   │   │   ├── MaterialInput/   # 素材输入组件
│   │   │   ├── CreationResult/  # 创作结果展示组件
│   │   │   └── CraftGraph/      # 工艺图谱组件
│   │   ├── pages/               # 页面组件
│   │   │   ├── Landing.jsx      # 首页/落地页
│   │   │   ├── Login.jsx        # 登录
│   │   │   ├── Register.jsx     # 注册
│   │   │   ├── Dashboard.jsx    # 工作台
│   │   │   ├── Create.jsx       # 创作页面
│   │   │   ├── History.jsx      # 历史记录
│   │   │   ├── MaterialLib.jsx  # 素材库
│   │   │   └── Profile.jsx      # 个人中心
│   │   ├── hooks/               # 自定义 Hooks
│   │   │   ├── useAuth.js
│   │   │   └── useCreation.js
│   │   ├── services/            # API 请求封装
│   │   │   ├── api.js           # Axios 实例
│   │   │   ├── auth.js
│   │   │   ├── material.js
│   │   │   └── creation.js
│   │   ├── store/               # Zustand 状态管理
│   │   │   ├── authStore.js
│   │   │   └── creationStore.js
│   │   ├── utils/               # 工具函数
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx              # 根组件 + 路由
│   │   ├── main.jsx             # 入口
│   │   └── index.css            # 全局样式
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── jsconfig.json
│
├── backend/                      # 后端项目
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 应用入口
│   │   ├── api/                 # API 路由层
│   │   │   ├── __init__.py
│   │   │   ├── deps.py          # 依赖注入
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py      # 认证接口
│   │   │       ├── material.py  # 素材管理
│   │   │       ├── creation.py  # 创作生成
│   │   │       └── user.py      # 用户相关
│   │   ├── core/                # 核心配置
│   │   │   ├── __init__.py
│   │   │   ├── config.py        # 配置管理
│   │   │   ├── security.py      # 安全相关 (JWT/密码)
│   │   │   └── database.py      # 数据库连接
│   │   ├── models/              # 数据模型 (SQLAlchemy)
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── material.py
│   │   │   └── creation.py
│   │   ├── schemas/             # Pydantic 模式
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── material.py
│   │   │   ├── creation.py
│   │   │   └── common.py        # 通用响应模式
│   │   ├── services/            # 业务逻辑层
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── material_service.py
│   │   │   └── creation_service.py
│   │   └── ai/                  # AI 适配层
│   │       ├── __init__.py
│   │       ├── base.py          # 抽象基类
│   │       ├── mock.py          # Mock 实现
│   │       ├── openai_provider.py
│   │       ├── qwen_provider.py
│   │       └── prompts.py       # Prompt 模板
│   ├── tests/                   # 测试
│   │   ├── __init__.py
│   │   ├── conftest.py          # 测试夹具
│   │   ├── test_auth.py
│   │   ├── test_material.py
│   │   ├── test_creation.py
│   │   └── test_ai.py
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py                   # 启动脚本
│
└── docs/                        # 文档
    └── specs/
        └── spec.md              # 本规格说明
```

---

## 三、数据模型设计

### 3.1 ER 关系概览

```
User (1) ──── (N) Material (1) ──── (N) Creation (1) ──── (N) ContentItem
                                                            │
                                                            └── CraftNode / CraftEdge (工艺图谱)
```

### 3.2 数据库表结构

#### 3.2.1 users — 用户表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Integer | PK, AUTOINCREMENT | 主键 |
| username | String(50) | UNIQUE, NOT NULL | 用户名 |
| email | String(100) | UNIQUE, NOT NULL | 邮箱 |
| hashed_password | String(200) | NOT NULL | bcrypt 哈希密码 |
| avatar | String(200) | NULL | 头像 URL |
| role | String(20) | DEFAULT 'user' | 角色: user/admin |
| is_active | Boolean | DEFAULT TRUE | 是否启用 |
| created_at | DateTime | DEFAULT NOW | 创建时间 |
| updated_at | DateTime | DEFAULT NOW, ON UPDATE | 更新时间 |

#### 3.2.2 materials — 素材表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Integer | PK, AUTOINCREMENT | 主键 |
| user_id | Integer | FK → users.id, NOT NULL | 所属用户 |
| title | String(200) | NOT NULL | 素材标题 |
| material_type | String(30) | NOT NULL | 类型: ancient_book/craft_text/oral_record/craft_keyword |
| content | Text | NOT NULL | 素材原文内容 |
| metadata_json | Text | NULL | 附加元信息 (JSON 字符串) |
| created_at | DateTime | DEFAULT NOW | 创建时间 |
| updated_at | DateTime | DEFAULT NOW | 更新时间 |

#### 3.2.3 creations — 创作记录表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Integer | PK, AUTOINCREMENT | 主键 |
| user_id | Integer | FK → users.id, NOT NULL | 所属用户 |
| material_id | Integer | FK → materials.id, NOT NULL | 关联素材 |
| title | String(200) | NOT NULL | 创作标题 |
| scenario | String(30) | NOT NULL | 场景: classroom/exhibition/video/study_tour |
| audience | String(30) | NOT NULL | 受众: child/teenager/adult/expert |
| status | String(20) | DEFAULT 'completed' | 状态: pending/completed/failed |
| model_used | String(50) | NULL | 使用的 AI 模型标识 |
| created_at | DateTime | DEFAULT NOW | 创建时间 |

#### 3.2.4 content_items — 内容条目表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Integer | PK, AUTOINCREMENT | 主键 |
| creation_id | Integer | FK → creations.id, NOT NULL | 所属创作 |
| item_type | String(30) | NOT NULL | 类型: 教案/展板/分镜/任务卡等 |
| title | String(200) | NOT NULL | 条目标题 |
| content | Text | NOT NULL | 条目内容 (Markdown) |
| sort_order | Integer | DEFAULT 0 | 排序序号 |

#### 3.2.5 craft_nodes — 工艺图谱节点表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Integer | PK, AUTOINCREMENT | 主键 |
| creation_id | Integer | FK → creations.id, NOT NULL | 所属创作 |
| node_id | String(50) | NOT NULL | 节点标识 (如 "step1") |
| label | String(100) | NOT NULL | 节点名称 |
| description | Text | NULL | 节点描述 |
| node_type | String(30) | NOT NULL | 类型: material/action/product |
| sort_order | Integer | DEFAULT 0 | 排序序号 |

#### 3.2.6 craft_edges — 工艺图谱边表

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Integer | PK, AUTOINCREMENT | 主键 |
| creation_id | Integer | FK → creations.id, NOT NULL | 所属创作 |
| source_node | String(50) | NOT NULL | 起始节点 ID |
| target_node | String(50) | NOT NULL | 目标节点 ID |
| label | String(100) | NULL | 边标签 (如 "产出") |

---

## 四、API 接口设计

### 4.1 通用约定

- **Base URL:** `/api/v1`
- **认证方式:** `Authorization: Bearer <JWT_TOKEN>`
- **响应格式:** 统一 JSON

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

- **错误码:**

| HTTP 状态码 | code | 说明 |
|-------------|------|------|
| 200 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证 / Token 失效 |
| 403 | 403 | 无权限 |
| 404 | 404 | 资源不存在 |
| 422 | 422 | 数据校验失败 |
| 500 | 500 | 服务器内部错误 |

### 4.2 认证接口

#### POST `/api/v1/auth/register` — 用户注册

**请求体:**
```json
{
  "username": "teacher01",
  "email": "teacher@example.com",
  "password": "SecurePass123"
}
```

**响应:**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "teacher01",
    "email": "teacher@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST `/api/v1/auth/login` — 用户登录

**请求体:**
```json
{
  "account": "teacher01",
  "password": "SecurePass123"
}
```
> `account` 可为用户名或邮箱。

**响应:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": 1,
    "username": "teacher01",
    "email": "teacher@example.com",
    "avatar": null,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 86400
  }
}
```

#### GET `/api/v1/auth/me` — 获取当前用户 [需认证]

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "teacher01",
    "email": "teacher@example.com",
    "avatar": null,
    "role": "user",
    "created_at": "2026-06-28T10:00:00"
  }
}
```

### 4.3 素材管理接口

#### POST `/api/v1/materials` — 创建素材 [需认证]

**请求体:**
```json
{
  "title": "天工开物·陶埏片段",
  "material_type": "ancient_book",
  "content": "宋子曰：水火既济而土合...",
  "metadata": {}
}
```

**响应:**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "title": "天工开物·陶埏片段",
    "material_type": "ancient_book",
    "content": "宋子曰：水火既济而土合...",
    "created_at": "2026-06-28T10:00:00"
  }
}
```

#### GET `/api/v1/materials` — 获取素材列表 [需认证]

**查询参数:**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| page | int | 1 | 页码 |
| page_size | int | 10 | 每页条数 |
| material_type | string | - | 类型筛选 |

**响应:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ {...}, {...} ],
    "total": 25,
    "page": 1,
    "page_size": 10
  }
}
```

#### GET `/api/v1/materials/{id}` — 获取素材详情 [需认证]

#### PUT `/api/v1/materials/{id}` — 更新素材 [需认证]

#### DELETE `/api/v1/materials/{id}` — 删除素材 [需认证]

### 4.4 创作生成接口

#### POST `/api/v1/creations` — 发起创作 [需认证]

**请求体:**
```json
{
  "material_id": 1,
  "scenario": "classroom",
  "audience": "child"
}
```

**响应:**
```json
{
  "code": 200,
  "message": "创作完成",
  "data": {
    "id": 1,
    "title": "天工开物·陶埏——课堂教学包",
    "scenario": "classroom",
    "audience": "child",
    "status": "completed",
    "content_items": [
      {
        "item_type": "lesson_plan",
        "title": "教案大纲",
        "content": "## 教学目标\n..."
      },
      {
        "item_type": "knowledge_card",
        "title": "知识点卡片",
        "content": "..."
      },
      {
        "item_type": "interactive_qa",
        "title": "课堂互动问答",
        "content": "..."
      },
      {
        "item_type": "homework",
        "title": "课后作业建议",
        "content": "..."
      }
    ],
    "craft_graph": {
      "nodes": [
        {"node_id": "step1", "label": "取土", "node_type": "material", "description": "..."},
        {"node_id": "step2", "label": "练泥", "node_type": "action", "description": "..."}
      ],
      "edges": [
        {"source_node": "step1", "target_node": "step2", "label": "经过"}
      ]
    },
    "created_at": "2026-06-28T10:05:00"
  }
}
```

#### GET `/api/v1/creations` — 获取创作历史列表 [需认证]

**查询参数:**

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| page | int | 1 | 页码 |
| page_size | int | 10 | 每页条数 |
| scenario | string | - | 场景筛选 |

#### GET `/api/v1/creations/{id}` — 获取创作详情 [需认证]

#### DELETE `/api/v1/creations/{id}` — 删除创作 [需认证]

#### POST `/api/v1/creations/{id}/switch-audience` — 切换受众重新生成 [需认证]

**请求体:**
```json
{
  "audience": "adult"
}
```

### 4.5 用户接口

#### PUT `/api/v1/users/me` — 更新个人信息 [需认证]

**请求体:**
```json
{
  "username": "new_name",
  "avatar": "https://..."
}
```

#### PUT `/api/v1/users/password` — 修改密码 [需认证]

**请求体:**
```json
{
  "old_password": "OldPass123",
  "new_password": "NewPass456"
}
```

#### GET `/api/v1/users/stats` — 用户统计 [需认证]

**响应:**
```json
{
  "code": 200,
  "data": {
    "material_count": 12,
    "creation_count": 35,
    "scenario_distribution": {
      "classroom": 10,
      "exhibition": 8,
      "video": 12,
      "study_tour": 5
    }
  }
}
```

---

## 五、前端页面与交互设计

### 5.1 路由设计

| 路径 | 页面 | 是否需登录 | 说明 |
|------|------|-----------|------|
| `/` | Landing | 否 | 落地页/产品介绍 |
| `/login` | Login | 否 | 登录 |
| `/register` | Register | 否 | 注册 |
| `/dashboard` | Dashboard | 是 | 工作台首页 |
| `/create` | Create | 是 | 创作页面 |
| `/history` | History | 是 | 历史记录列表 |
| `/history/:id` | CreationDetail | 是 | 创作详情 |
| `/materials` | MaterialLib | 是 | 素材库 |
| `/profile` | Profile | 是 | 个人中心 |

### 5.2 页面详细设计

#### 5.2.1 落地页 (Landing)

- 顶部导航栏：Logo、功能特性、开始使用按钮
- Hero 区域：产品标语 "一键激活古籍非遗，让传统文化活起来"
- 功能特性区：四步流程图示 (输入素材 → AI解析 → 多场景生成 → 一键导出)
- 场景展示区：四大场景卡片 (课堂教学/展馆展览/短视频/研学活动)
- 底部 CTA：立即开始按钮 → 跳转注册或工作台

#### 5.2.2 登录/注册页

- 居中卡片式表单
- 登录：账号 (用户名/邮箱) + 密码
- 注册：用户名 + 邮箱 + 密码 + 确认密码
- 表单校验：前端实时校验
- 登录成功后 Token 存入 localStorage，跳转 `/dashboard`

#### 5.2.3 工作台 (Dashboard)

- 左侧侧边栏：Logo、导航菜单 (工作台/创作/历史/素材库/个人中心)
- 顶部栏：当前页面标题、用户头像下拉菜单
- 主区域：
  - 欢迎卡片 + 快捷操作 (开始创作/上传素材)
  - 统计概览：素材数、创作数、场景分布饼图
  - 最近创作列表 (最近5条)

#### 5.2.4 创作页面 (Create) — 核心页面

**布局：左右分栏 (左侧素材输入，右侧结果展示)**

**左侧 - 素材输入区:**
1. 素材来源选择：
   - 选择已有素材 (从素材库下拉选取)
   - 直接输入新素材
2. 素材类型选择 (4种类型 Tab 切换)：古籍原文 / 非遗工艺文字 / 口述记录 / 工艺关键词
3. 素材内容输入：多行文本框 (支持粘贴长文本)
4. 场景选择：四大场景卡片单选
5. 受众选择：儿童 / 青少年 / 成人 / 专家
6. 生成按钮

**右侧 - 结果展示区:**
1. 生成中状态：加载动画 + "AI正在创作中..." 文案
2. 生成完成后：
   - 内容标签页 (Tab)：按场景输出内容类型展示
   - 每个内容块支持 Markdown 渲染
   - 受众切换器：一键切换受众重新生成
   - 工艺图谱可视化：节点-边关系图 (Canvas/SVG 绘制)
   - 导出按钮：支持复制文本、导出 Markdown

#### 5.2.5 历史记录页 (History)

- 筛选栏：场景筛选下拉、搜索框
- 列表/卡片视图切换
- 创作卡片：标题、场景标签、受众标签、时间、操作按钮 (查看/删除)
- 分页器

#### 5.2.6 创作详情页 (CreationDetail)

- 复用创作页面的结果展示区布局
- 显示原始素材 + 生成内容 + 工艺图谱
- 支持受众切换重新生成
- 导出功能

#### 5.2.7 素材库页 (MaterialLib)

- 素材类型筛选 Tab
- 素材卡片列表：标题、类型标签、内容预览、时间、操作 (编辑/删除/用于创作)
- 新建素材按钮 → 弹窗表单
- 分页器

#### 5.2.8 个人中心页 (Profile)

- 个人信息表单：用户名、邮箱、头像
- 修改密码表单
- 用户统计数据

### 5.3 交互细节

- 全局 Toast 通知：操作成功/失败反馈
- 全局 Loading 状态：API 请求时的骨架屏
- 路由守卫：未登录访问需认证页面自动跳转登录
- Token 自动刷新：401 响应时清除 Token 并跳转登录
- 响应式设计：适配桌面端 (主要) 和平板端

---

## 六、AI 服务与 Prompt 设计

### 6.1 AI 适配层架构

采用策略模式 + 工厂模式，支持多模型切换：

```python
# 抽象基类
class AIProvider(ABC):
    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> str:
        """生成文本"""
        pass

# 实现类
class MockProvider(AIProvider):     # 默认，返回预设模板
class OpenAIProvider(AIProvider):   # OpenAI GPT
class QwenProvider(AIProvider):     # 通义千问

# 工厂
def get_provider() -> AIProvider:
    # 根据 config.AI_PROVIDER 返回对应实例
```

### 6.2 配置切换

```env
# .env
AI_PROVIDER=mock          # mock | openai | qwen
AI_API_KEY=               # 真实 API Key
AI_MODEL=gpt-4o-mini      # 模型名
AI_BASE_URL=              # 自定义 API 地址 (可选)
```

### 6.3 Prompt 模板设计

#### 6.3.1 系统 Prompt (通用)

```
你是「遗脉工坊」的 AI 创作助手，专注于将古籍文献与非遗工艺素材转化为适配不同场景的文化传播内容。

你的能力：
1. 解析素材中的文化核心信息（年代、工艺、历史寓意）
2. 根据场景和受众生成适配的内容
3. 将晦涩古文转化为通俗易懂的语言
4. 提取工艺流程并构建可视化图谱

输出要求：
- 内容准确，不编造史实
- 语言风格适配目标受众
- 结构清晰，使用 Markdown 格式
- 工艺图谱使用 JSON 结构化输出
```

#### 6.3.2 场景 Prompt 模板

**课堂教学场景:**
```
请基于以下素材，为{audience}生成课堂教学内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 教案大纲（教学目标、重点难点、课时安排）
2. 知识点卡片（3-5个核心知识点，每个含简要解释）
3. 课堂互动问答（5道互动问题及参考答案）
4. 课后作业建议（2-3项实践性作业）

要求：语言生动有趣，适合{audience}理解。
```

**展馆展览场景:**
```
请基于以下素材，为{audience}生成展馆展览内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 展板文案（主题展板介绍文字，200字内）
2. 展品说明牌（3-5件核心展品的说明文字，每件50字内）
3. 语音导览词（完整导览脚本，适合语音播报）
4. 参观引导语（入口/出口/互动区的引导文字）

要求：文字简洁专业，适合{audience}阅读。
```

**短视频宣传场景:**
```
请基于以下素材，为{audience}生成短视频宣传内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 视频分镜脚本（5-8个分镜，每个含画面描述、时长、转场）
2. 口播文案（完整旁白文字，适合1-3分钟视频）
3. 字幕文案（关键字幕文字列表）
4. 封面建议文案（3个封面标题方案）

要求：节奏明快，有传播力，吸引{audience}观看。
```

**研学活动场景:**
```
请基于以下素材，为{audience}生成研学活动内容包：

素材类型：{material_type}
素材内容：{content}

请生成以下内容，每部分用 ## 标题分隔：
1. 研学手册大纲（活动主题、学习目标、流程安排）
2. 体验活动设计（2-3个可操作的体验活动）
3. 研学任务卡（5个探究性任务及引导提示）
4. 安全须知（活动相关的安全注意事项）

要求：内容具有可操作性，适合{audience}参与。
```

#### 6.3.3 工艺图谱 Prompt

```
请从以下素材中提取工艺流程，并生成结构化的工艺图谱。

素材内容：{content}

请严格按以下 JSON 格式输出（只输出JSON，不要其他文字）：
{
  "nodes": [
    {
      "node_id": "step1",
      "label": "步骤名称",
      "node_type": "material|action|product",
      "description": "步骤描述"
    }
  ],
  "edges": [
    {
      "source_node": "step1",
      "target_node": "step2",
      "label": "关系标签"
    }
  ]
}
```

### 6.4 Mock 模式数据策略

Mock 模式根据 `material_type` 和 `scenario` 返回预设的模板化内容：

1. 内容模板按 4 种场景 × 4 种素材类型 = 16 套预设模板
2. 模板中使用素材内容的关键词进行简单替换填充
3. 工艺图谱返回预设的 5-8 节点示例图谱
4. 响应延迟模拟 1-2 秒 (模拟真实 API 调用)

---

## 七、核心用户流程

### 7.1 新用户注册到首次创作流程

```
访问落地页 → 点击"开始使用" → 注册账号 → 登录 → 进入工作台
→ 点击"开始创作" → 输入素材 → 选择场景+受众 → 点击生成
→ 等待AI创作 → 查看结果 → 切换受众对比 → 导出内容
```

### 7.2 素材管理流程

```
进入素材库 → 点击"新建素材" → 填写标题/类型/内容 → 保存
→ 在创作时可直接从素材库选取已有素材
```

### 7.3 创作与受众切换流程

```
选择素材 → 选择场景 → 选择受众(如儿童) → 生成
→ 查看结果 → 切换受众(如成人) → 重新生成该受众版本
→ 对比不同受众版本 → 导出所需版本
```

### 7.4 历史复用流程

```
进入历史记录 → 筛选场景 → 查看历史创作 → 点击查看详情
→ 基于历史创作切换受众重新生成 → 导出
```

---

## 八、测试策略

### 8.1 后端测试 (pytest)

| 测试模块 | 覆盖范围 | 测试数 |
|----------|----------|--------|
| test_auth | 注册、登录、获取当前用户、Token 校验 | 8+ |
| test_material | 素材 CRUD、权限校验、分页 | 10+ |
| test_creation | 创作生成、历史查询、受众切换、删除 | 8+ |
| test_ai | Mock 生成、Provider 工厂、Prompt 构建 | 5+ |

**测试工具:**
- `pytest` + `pytest-asyncio` 异步测试
- `httpx.AsyncClient` API 集成测试
- 测试数据库使用内存 SQLite (`sqlite:///:memory:`)

### 8.2 前端测试

- 组件渲染测试 (React Testing Library)
- 关键交互流程手动验证
- 跨浏览器兼容性验证 (Chrome / Firefox / Safari)

### 8.3 验收标准

1. 用户可完成注册 → 登录 → 创作 → 导出全流程
2. Mock 模式下四大场景均可生成完整内容包
3. 工艺图谱可视化正确展示节点和边
4. 受众切换功能正常工作
5. 历史记录可查看、删除、复用
6. 素材库 CRUD 功能完整
7. 响应式布局在主流屏幕尺寸下正常显示

---

## 九、部署方案

### 9.1 开发环境

```bash
# 后端
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # 编辑配置
python run.py  # 启动在 :8000

# 前端
cd frontend
npm install
npm run dev  # 启动在 :5173
```

### 9.2 生产部署

- 前端：`npm run build` 构建静态文件，由 Nginx 托管
- 后端：`uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Nginx 反向代理：前端静态文件 + `/api` 代理到后端

### 9.3 环境变量配置

```env
# 数据库
DATABASE_URL=sqlite:///./yimai.db

# JWT
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI 配置
AI_PROVIDER=mock
AI_API_KEY=
AI_MODEL=gpt-4o-mini
AI_BASE_URL=

# 跨域
CORS_ORIGINS=http://localhost:5173
```

---

## 十、验收标准汇总

| 序号 | 验收项 | 验收标准 |
|------|--------|----------|
| 1 | 用户注册登录 | 注册/登录/Token 认证全流程可用 |
| 2 | 素材管理 | 四类素材的增删改查功能完整 |
| 3 | AI 创作 | 四大场景均可生成完整内容包 (Mock 模式) |
| 4 | 工艺图谱 | 图谱节点和边可视化正确展示 |
| 5 | 受众切换 | 四种受众一键切换重新生成 |
| 6 | 历史记录 | 创作历史保存/查看/删除/复用 |
| 7 | 真实 API | 配置 API Key 后可切换真实生成模式 |
| 8 | UI 界面 | Tailwind + shadcn/ui 风格美观，响应式适配 |
| 9 | 数据持久 | SQLite 正常存储，重启不丢数据 |
| 10 | 文档 | 规格说明 + README 部署文档完整 |

---

*本规格说明基于需求梳理对话记录整理，涵盖完整设计细节。*
