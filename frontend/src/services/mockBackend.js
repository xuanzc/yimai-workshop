// frontend/src/services/mockBackend.js
// 客户端 Mock 后端 - 当真实后端不可用时（如 GitHub Pages）自动启用
// 使用 localStorage 持久化数据，模拟后端全部 API 行为

// ============ 工具函数 ============
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const genId = () => Date.now() + Math.floor(Math.random() * 10000);

const now = () => new Date().toISOString();

const success = (data, message = 'success') => ({ code: 200, message, data });

const error = (code, message) => Promise.reject({ code, message, detail: message });

// ============ localStorage 数据层 ============
const DB = {
  getUsers: () => JSON.parse(localStorage.getItem('ym_users') || '[]'),
  setUsers: (u) => localStorage.setItem('ym_users', JSON.stringify(u)),
  getMaterials: () => JSON.parse(localStorage.getItem('ym_materials') || '[]'),
  setMaterials: (m) => localStorage.setItem('ym_materials', JSON.stringify(m)),
  getCreations: () => JSON.parse(localStorage.getItem('ym_creations') || '[]'),
  setCreations: (c) => localStorage.setItem('ym_creations', JSON.stringify(c)),
};

// ============ Token 生成 ============
const genToken = (userId) => `mock_token_${userId}_${Date.now()}`;
const parseToken = (token) => {
  if (!token || !token.startsWith('mock_token_')) return null;
  const parts = token.split('_');
  return parseInt(parts[2]);
};

// ============ Mock 内容生成（移植自后端 mock.py）============
const ITEM_TYPE_MAP = {
  classroom: ['lesson_plan', 'knowledge_card', 'interactive_qa', 'homework'],
  exhibition: ['exhibit_text', 'display_card', 'audio_guide', 'visitor_guide'],
  video: ['storyboard', 'voiceover', 'subtitle', 'cover_copy'],
  study_tour: ['handbook', 'activity_design', 'task_card', 'safety_notice'],
};

const SCENARIO_TITLES = {
  classroom: '课堂教学包',
  exhibition: '展馆展览包',
  video: '短视频宣传包',
  study_tour: '研学活动包',
};

function mockContent(scenario, content) {
  const snippet = (content || '素材内容').slice(0, 20);
  const templates = {
    classroom: `## 教案大纲

**教学目标：**
1. 了解「${snippet}...」的文化背景与历史价值
2. 掌握核心工艺流程与关键知识点
3. 培养对传统文化的兴趣与保护意识

**重点难点：**
- 重点：理解工艺步骤的先后逻辑
- 难点：古文术语的现代转化理解

**课时安排：** 1课时（45分钟）

## 知识点卡片

**知识点1：历史渊源**
该项工艺可追溯至古代，承载着丰富的历史文化信息，是中华文明的重要组成部分。

**知识点2：核心工艺**
工艺流程包含选材、制作、加工等关键环节，每一步都体现着匠人智慧。

**知识点3：文化寓意**
该工艺不仅具有实用价值，更蕴含着深厚的精神文化内涵。

## 课堂互动问答

**Q1：** 这项工艺最早出现在什么时期？
**A：** 根据史料记载，该工艺历史悠久，体现了古人的智慧与创造力。

**Q2：** 工艺中最关键的步骤是什么？
**A：** 每个步骤都不可或缺，但核心环节决定了最终成品的质量。

**Q3：** 现代生活中如何传承这项工艺？
**A：** 可以通过体验活动、文创产品等方式让更多人了解和参与。

## 课后作业建议

1. **实践作业：** 尝试用简易材料模拟工艺流程中的一个步骤
2. **调研作业：** 查找本地类似的非遗项目并撰写简短报告
3. **创意作业：** 设计一份推广该项工艺的宣传海报`,

    exhibition: `## 展板文案

**千年匠心·${snippet.slice(0, 15)}...**

本展区展示了中国传统工艺的精湛技艺与深厚文化底蕴。从选材到成品，每一道工序都凝聚着匠人的心血与智慧，是中华文明生生不息的生动见证。

## 展品说明牌

**展品1：原料标本**
展示工艺所用原始材料，可见其天然纹理与质感特征。

**展品2：工具器具**
匠人使用的传统工具，每一件都有百年以上使用历史。

**展品3：工艺半成品**
展示制作过程中的中间形态，可直观了解工艺步骤。

## 语音导览词

各位游客，欢迎来到本展区。您眼前所见的，是一项传承千年的中国传统工艺。让我们一同走进匠人的世界，感受指尖上的文化传承。从最初的原材料选择，到最终成品的呈现，每一个环节都承载着历史的记忆与文化的温度……

## 参观引导语

**入口处：** 欢迎进入匠心世界，请沿箭头方向参观
**互动区：** 欢迎亲手体验，感受工艺魅力
**出口处：** 感谢参观，文创产品可在商店选购`,

    video: `## 视频分镜脚本

**分镜1（0-5秒）：** 开场特写——工艺成品细节展示，暖色调灯光 | 转场：淡入
**分镜2（5-15秒）：** 全景——匠人工作场景，环境音 | 转场：切换
**分镜3（15-30秒）：** 中景——核心工艺步骤特写 | 转场：推移
**分镜4（30-45秒）：** 采访——匠人讲述传承故事 | 转场：切换
**分镜5（45-60秒）：** 蒙太奇——工艺流程快速剪辑 | 转场：叠化
**分镜6（60-75秒）：** 成品展示+字幕——文化价值总结 | 转场：淡出

## 口播文案

在中华大地上，有这样一项传承千年的工艺。它不仅仅是一门手艺，更是一段跨越时空的对话。从选材的那一刻起，匠人便与材料建立了默契。每一道工序，都是对传统的致敬。每一次打磨，都是对完美的追求。这，就是中国匠心……

## 字幕文案

- 「千年传承 匠心独运」
- 「每一件作品 都是时光的礼物」
- 「传统工艺 现代守护」
- 「让文化在手心延续」

## 封面建议文案

方案1：「千年工艺·一指匠心」
方案2：「看见·非遗的力量」
方案3：「手艺中国——${snippet.slice(0, 10)}...」`,

    study_tour: `## 研学手册大纲

**活动主题：** 探秘传统工艺——${snippet.slice(0, 15)}...研学之旅
**学习目标：**
1. 了解该项工艺的历史渊源与文化价值
2. 体验工艺制作的核心环节
3. 思考传统工艺的现代传承路径

**流程安排：**
- 09:00-09:30 开营仪式与安全讲解
- 09:30-10:30 展厅参观与知识学习
- 10:30-12:00 工艺体验（上）
- 12:00-13:00 午餐休息
- 13:00-14:30 工艺体验（下）
- 14:30-15:30 成果展示与分享
- 15:30-16:00 结营总结

## 体验活动设计

**活动1：原料辨识**
提供多种原料样本，学生通过观察、触摸、闻味等方式辨识正确原料，培养感知能力。

**活动2：工序体验**
在匠人指导下，学生亲手完成工艺中的一个简单步骤，体验匠人精神。

## 研学任务卡

**任务1：** 记录工艺流程中的5个关键步骤，并标注每步的作用
**任务2：** 采访一位匠人，记录他学习工艺的故事
**任务3：** 绘制该项工艺的思维导图
**任务4：** 提出一个让传统工艺走进现代生活的创意方案
**任务5：** 撰写一段100字的研学感悟

## 安全须知

1. 体验活动时请佩戴防护手套，避免直接接触高温或锋利工具
2. 听从匠人指导，未经允许不得擅自操作设备
3. 保持活动区域整洁，工具用完归位
4. 如有不适请立即告知带队老师`,
  };
  return templates[scenario] || templates.classroom;
}

function mockCraftGraph() {
  return {
    nodes: [
      { node_id: 'step1', label: '选材备料', node_type: 'material', description: '精选优质原材料，确保品质', sort_order: 0 },
      { node_id: 'step2', label: '初步加工', node_type: 'action', description: '对原料进行初步处理与修整', sort_order: 1 },
      { node_id: 'step3', label: '核心制作', node_type: 'action', description: '按照传统技法进行核心工艺', sort_order: 2 },
      { node_id: 'step4', label: '精细修整', node_type: 'action', description: '对半成品进行精细修整与完善', sort_order: 3 },
      { node_id: 'step5', label: '装饰美化', node_type: 'action', description: '添加装饰元素，提升艺术性', sort_order: 4 },
      { node_id: 'step6', label: '成品检验', node_type: 'product', description: '质量检验与成品包装', sort_order: 5 },
    ],
    edges: [
      { source_node: 'step1', target_node: 'step2', label: '经过' },
      { source_node: 'step2', target_node: 'step3', label: '进入' },
      { source_node: 'step3', target_node: 'step4', label: '转入' },
      { source_node: 'step4', target_node: 'step5', label: '接着' },
      { source_node: 'step5', target_node: 'step6', label: '产出' },
    ],
  };
}

function parseContentItems(raw, scenario) {
  const itemTypes = ITEM_TYPE_MAP[scenario] || ITEM_TYPE_MAP.classroom;
  const sections = raw.split(/^##\s+/m).filter((s) => s.trim());
  const items = sections.map((section, idx) => {
    const lines = section.trim().split('\n', 1);
    const title = lines[0].trim();
    const content = section.substring(lines[0].length).trim();
    return {
      item_type: itemTypes[idx] || `section_${idx}`,
      title,
      content,
      sort_order: idx,
    };
  });
  return items.length > 0 ? items : [{ item_type: 'content', title: '生成内容', content: raw, sort_order: 0 }];
}

// ============ API 路由处理 ============
async function handleRequest(method, path, body, params) {
  await delay(800 + Math.random() * 700); // 模拟网络延迟

  // --- 认证接口 ---
  if (method === 'POST' && path === '/auth/register') {
    const users = DB.getUsers();
    if (users.find((u) => u.username === body.username)) {
      return error(400, '用户名已存在');
    }
    if (users.find((u) => u.email === body.email)) {
      return error(400, '邮箱已被注册');
    }
    const user = {
      id: genId(),
      username: body.username,
      email: body.email,
      password: body.password,
      avatar: null,
      role: 'user',
      is_active: true,
      created_at: now(),
      updated_at: now(),
    };
    users.push(user);
    DB.setUsers(users);
    const token = genToken(user.id);
    return success({ id: user.id, username: user.username, email: user.email, token }, '注册成功');
  }

  if (method === 'POST' && path === '/auth/login') {
    const users = DB.getUsers();
    const user = users.find((u) => u.username === body.account || u.email === body.account);
    if (!user || user.password !== body.password) {
      return error(401, '账号或密码错误');
    }
    const token = genToken(user.id);
    return success({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      token,
      expires_in: 86400,
    }, '登录成功');
  }

  if (method === 'GET' && path === '/auth/me') {
    const userId = parseToken(localStorage.getItem('token'));
    if (!userId) return error(401, '未认证');
    const user = DB.getUsers().find((u) => u.id === userId);
    if (!user) return error(401, '用户不存在');
    return success({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      created_at: user.created_at,
    });
  }

  // --- 素材接口 ---
  if (method === 'POST' && path === '/materials') {
    const userId = parseToken(localStorage.getItem('token'));
    const material = {
      id: genId(),
      user_id: userId,
      title: body.title,
      material_type: body.material_type,
      content: body.content,
      metadata_json: body.metadata ? JSON.stringify(body.metadata) : null,
      created_at: now(),
      updated_at: now(),
    };
    const materials = DB.getMaterials();
    materials.push(material);
    DB.setMaterials(materials);
    return success(material, '创建成功');
  }

  if (method === 'GET' && path === '/materials') {
    const userId = parseToken(localStorage.getItem('token'));
    let materials = DB.getMaterials().filter((m) => m.user_id === userId);
    if (params?.material_type) {
      materials = materials.filter((m) => m.material_type === params.material_type);
    }
    const total = materials.length;
    const page = parseInt(params?.page || 1);
    const pageSize = parseInt(params?.page_size || 10);
    const items = materials.slice((page - 1) * pageSize, page * pageSize);
    return success({ items, total, page, page_size: pageSize });
  }

  if (method === 'GET' && path.match(/^\/materials\/\d+$/)) {
    const id = parseInt(path.split('/')[2]);
    const material = DB.getMaterials().find((m) => m.id === id);
    if (!material) return error(404, '素材不存在');
    return success(material);
  }

  if (method === 'PUT' && path.match(/^\/materials\/\d+$/)) {
    const id = parseInt(path.split('/')[2]);
    const materials = DB.getMaterials();
    const idx = materials.findIndex((m) => m.id === id);
    if (idx === -1) return error(404, '素材不存在');
    if (body.title !== undefined) materials[idx].title = body.title;
    if (body.content !== undefined) materials[idx].content = body.content;
    if (body.metadata !== undefined) materials[idx].metadata_json = JSON.stringify(body.metadata);
    materials[idx].updated_at = now();
    DB.setMaterials(materials);
    return success(materials[idx], '更新成功');
  }

  if (method === 'DELETE' && path.match(/^\/materials\/\d+$/)) {
    const id = parseInt(path.split('/')[2]);
    const materials = DB.getMaterials().filter((m) => m.id !== id);
    DB.setMaterials(materials);
    return success(null, '删除成功');
  }

  // --- 创作接口 ---
  if (method === 'POST' && path === '/creations') {
    const userId = parseToken(localStorage.getItem('token'));
    const materials = DB.getMaterials();
    const material = materials.find((m) => m.id === body.material_id && m.user_id === userId);
    if (!material) return error(400, '素材不存在');

    const rawContent = mockContent(body.scenario, material.content);
    const contentItems = parseContentItems(rawContent, body.scenario);
    const craftGraph = mockCraftGraph();

    const creation = {
      id: genId(),
      user_id: userId,
      material_id: material.id,
      title: `${material.title}——${SCENARIO_TITLES[body.scenario]}`,
      scenario: body.scenario,
      audience: body.audience,
      status: 'completed',
      model_used: 'mock:demo',
      content_items: contentItems,
      craft_graph: craftGraph,
      created_at: now(),
    };

    const creations = DB.getCreations();
    creations.push(creation);
    DB.setCreations(creations);

    return success({
      id: creation.id,
      title: creation.title,
      scenario: creation.scenario,
      audience: creation.audience,
      status: creation.status,
      model_used: creation.model_used,
      material_id: creation.material_id,
      content_items: creation.content_items,
      craft_graph: creation.craft_graph,
      created_at: creation.created_at,
    }, '创作完成');
  }

  if (method === 'GET' && path === '/creations') {
    const userId = parseToken(localStorage.getItem('token'));
    let creations = DB.getCreations().filter((c) => c.user_id === userId);
    if (params?.scenario) {
      creations = creations.filter((c) => c.scenario === params.scenario);
    }
    const total = creations.length;
    const page = parseInt(params?.page || 1);
    const pageSize = parseInt(params?.page_size || 10);
    const items = creations
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice((page - 1) * pageSize, page * pageSize)
      .map((c) => {
        const material = DB.getMaterials().find((m) => m.id === c.material_id);
        return {
          id: c.id,
          title: c.title,
          scenario: c.scenario,
          audience: c.audience,
          status: c.status,
          material_title: material ? material.title : null,
          created_at: c.created_at,
        };
      });
    return success({ items, total, page, page_size: pageSize });
  }

  if (method === 'GET' && path.match(/^\/creations\/\d+$/)) {
    const id = parseInt(path.split('/')[2]);
    const creation = DB.getCreations().find((c) => c.id === id);
    if (!creation) return error(404, '创作不存在');
    return success({
      id: creation.id,
      title: creation.title,
      scenario: creation.scenario,
      audience: creation.audience,
      status: creation.status,
      model_used: creation.model_used,
      material_id: creation.material_id,
      content_items: creation.content_items,
      craft_graph: creation.craft_graph,
      created_at: creation.created_at,
    });
  }

  if (method === 'DELETE' && path.match(/^\/creations\/\d+$/)) {
    const id = parseInt(path.split('/')[2]);
    const creations = DB.getCreations().filter((c) => c.id !== id);
    DB.setCreations(creations);
    return success(null, '删除成功');
  }

  if (method === 'POST' && path.match(/^\/creations\/\d+\/switch-audience$/)) {
    const id = parseInt(path.split('/')[2]);
    const creation = DB.getCreations().find((c) => c.id === id);
    if (!creation) return error(404, '创作不存在');

    const material = DB.getMaterials().find((m) => m.id === creation.material_id);
    const rawContent = mockContent(creation.scenario, material ? material.content : '');
    const contentItems = parseContentItems(rawContent, creation.scenario);
    const craftGraph = mockCraftGraph();

    const newCreation = {
      ...creation,
      id: genId(),
      audience: body.audience,
      content_items: contentItems,
      craft_graph: craftGraph,
      created_at: now(),
    };

    const creations = DB.getCreations();
    creations.push(newCreation);
    DB.setCreations(creations);

    return success({
      id: newCreation.id,
      title: newCreation.title,
      scenario: newCreation.scenario,
      audience: newCreation.audience,
      status: newCreation.status,
      model_used: newCreation.model_used,
      material_id: newCreation.material_id,
      content_items: newCreation.content_items,
      craft_graph: newCreation.craft_graph,
      created_at: newCreation.created_at,
    }, '切换成功');
  }

  // --- 用户接口 ---
  if (method === 'PUT' && path === '/users/me') {
    const userId = parseToken(localStorage.getItem('token'));
    const users = DB.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return error(404, '用户不存在');
    if (body.username !== undefined) {
      const existing = users.find((u) => u.username === body.username && u.id !== userId);
      if (existing) return error(400, '用户名已存在');
      users[idx].username = body.username;
    }
    if (body.avatar !== undefined) users[idx].avatar = body.avatar;
    users[idx].updated_at = now();
    DB.setUsers(users);
    return success({ id: users[idx].id, username: users[idx].username, email: users[idx].email, avatar: users[idx].avatar }, '更新成功');
  }

  if (method === 'PUT' && path === '/users/password') {
    const userId = parseToken(localStorage.getItem('token'));
    const users = DB.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return error(404, '用户不存在');
    if (users[idx].password !== body.old_password) return error(400, '原密码错误');
    users[idx].password = body.new_password;
    DB.setUsers(users);
    return success(null, '密码修改成功');
  }

  if (method === 'GET' && path === '/users/stats') {
    const userId = parseToken(localStorage.getItem('token'));
    const materials = DB.getMaterials().filter((m) => m.user_id === userId);
    const creations = DB.getCreations().filter((c) => c.user_id === userId);
    const distribution = {};
    creations.forEach((c) => {
      distribution[c.scenario] = (distribution[c.scenario] || 0) + 1;
    });
    return success({
      material_count: materials.length,
      creation_count: creations.length,
      scenario_distribution: distribution,
    });
  }

  return error(404, `Mock: 未匹配到路由 ${method} ${path}`);
}

// ============ 导出 ============
export const isMockMode = () => {
  // GitHub Pages 或非 localhost 环境使用 Mock 模式
  const host = window.location.hostname;
  return host.includes('github.io') || (host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0');
};

export async function mockRequest(method, url, data, params) {
  const path = url.replace(/^\/api\/v1/, '');
  return handleRequest(method, path, data, params);
}
