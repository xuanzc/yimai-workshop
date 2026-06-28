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

// ============ 演示账号与样例数据 ============
const DEMO_USER = {
  username: 'demo',
  email: 'demo@yimai.workshop',
  password: 'demo123',
};

const SAMPLE_MATERIALS = [
  {
    title: '《天工开物·陶埏》片段',
    material_type: 'ancient_book',
    content: '宋子曰：水火既济而土合。成器天下之前，始于炊爨之所需。大垔之未陶也，有虞氏之尚瓦棺也，夏后氏之垔周也。陶成雅器，有素肌玉骨之象焉。掩映几筵，文明可掬。岂固糠秕而已哉？凡陶之家，以茅苫前门，不得有窗棂。盖陶家忌明暗，茅屋取其气不散也。掘地深二尺，取细土和泥，蹂践使柔韧。过筛去其粗砾，渍水经宿，乃可制器。其器大小不等，大者缸瓮，小者碗碟。轮车既转，两手掬泥置于车盘之上，拇指中指插入，随转随开，遂成碗形。稍干修削，入窑烧之。柴薪累叠，火候足则止。',
  },
  {
    title: '景德镇手工制瓷七十二道工序',
    material_type: 'craft_text',
    content: '景德镇手工制瓷工艺始载于宋代，至明清趋于鼎盛，完整工序多达七十二道，概括为：\n\n一、练泥：取高岭土与瓷石，经粉碎、淘洗、沉淀、揉练，使泥料柔韧均匀，无气孔气泡。\n\n二、拉坯：将泥团置于辘轳车盘中央，双手随轮旋转，以拇指开孔，手指挤压成形，制成碗、瓶、盘等坯体初形。\n\n三、印坯：对不规则器形，以刻有纹样的模具印压泥片，合模成形。\n\n四、晒坯：将坯体置于晾坯架上，阴干至适当硬度，防止变形开裂。\n\n五、修坯：以铁刀旋削坯体内外，使其厚薄均匀、表面光洁，修去余泥。\n\n六、画坯：用青花料或釉里红在素坯上描绘纹饰，线条流畅、构图讲究。\n\n七、施釉：将坯体浸入釉浆，或浇釉、吹釉，使表面均匀覆盖一层釉料。\n\n八、烧窑：装入匣钵，入窑码放，以松柴为燃料，升温至一千三百度，经二十余小时烧成。\n\n九、开窑：冷却后开窑取出，拣选合格成品。次品可复烧或另作他用。\n\n每一步皆需匠人凭经验判断火候、厚薄、釉色，代代口传心授，方得"白如玉、明如镜、薄如纸、声如磬"之景德镇瓷。',
  },
  {
    title: '皮影戏传承人口述记录',
    material_type: 'oral_record',
    content: `【受访人：王师傅，陕西华县皮影戏省级传承人，从艺四十五年】\n\n"我这皮影啊，是跟我师父学的。我师父叫李德茂，他师父的师父，那都追溯到清朝光绪年间了。我十二岁开始学，那时候就是跟着师父走村串乡，晚上搭个幕布，点上汽灯，就开始唱了。\n\n皮影的皮子，必须用上好的牛皮，泡水、刮薄、晾干，一张皮子处理下来得半个月。刻的时候用三十多把刻刀，最小的刀比绣花针还细。一个人物头茬，光刻就得三天。刻完再上色，红、绿、黑、黄，用的都是矿物颜料，几十年不褪色。\n\n唱腔是老腔，跟秦腔不一样，我们叫碗碗腔，因为敲的那个碗碗，叮叮当当的。一台戏四个人，签手、前声、上档、下档，四个人撑一台戏，所以叫四股弦。\n\n现在最大的难处是没人学。年轻人都出去打工了，学这个挣不了钱。我带了三个徒弟，两个转行了，就剩一个还在坚持。我就怕这手艺断在我手里，那对不起师父，也对不起祖宗传下来的东西。"`,
  },
  {
    title: '蓝印花布工艺关键词',
    material_type: 'craft_keyword',
    content: '蓝印花布、刻板、刮浆、染色、晾晒、靛蓝、防染、黄豆浆、桐油纸、漏印、冰裂纹、青白对比、民间印染、南通、染坊、镂空花版、蓝草、发酵染缸、氧化还原、传统纹样、吉祥图案、凤戏牡丹、麒麟送子、鲤鱼跳龙门',
  },
];

// 为样例素材生成样例创作
function buildSampleCreation(material, scenario, audience) {
  const rawContent = mockContent(scenario, material.content);
  const contentItems = parseContentItems(rawContent, scenario);
  const craftGraph = mockCraftGraph();
  const ts = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
  return {
    id: genId(),
    user_id: null, // 稍后设置
    material_id: material.id,
    title: `${material.title}——${SCENARIO_TITLES[scenario]}`,
    scenario,
    audience,
    status: 'completed',
    model_used: 'mock:demo',
    content_items: contentItems,
    craft_graph: craftGraph,
    created_at: ts,
  };
}

export function ensureDemoData() {
  // 只在 Mock 模式下生效
  if (!isMockMode()) return;

  // 检查是否已初始化
  if (localStorage.getItem('ym_demo_seeded') === 'true') {
    // 确保 demo 用户存在
    const users = DB.getUsers();
    if (!users.find((u) => u.username === DEMO_USER.username)) {
      seedDemo();
    }
    return;
  }
  seedDemo();
}

function seedDemo() {
  // 创建 demo 用户
  const users = DB.getUsers();
  const demoUser = {
    id: genId(),
    username: DEMO_USER.username,
    email: DEMO_USER.email,
    password: DEMO_USER.password,
    avatar: null,
    role: 'user',
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  users.push(demoUser);
  DB.setUsers(users);

  // 创建样例素材
  const materials = DB.getMaterials();
  const sampleMats = SAMPLE_MATERIALS.map((m, i) => ({
    ...m,
    id: genId() + i,
    user_id: demoUser.id,
    metadata_json: null,
    created_at: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
  }));
  DB.setMaterials([...materials, ...sampleMats]);

  // 创建样例创作（3条，覆盖不同场景）
  const creations = DB.getCreations();
  const sampleCreations = [
    buildSampleCreation(sampleMats[0], 'classroom', 'child'),
    buildSampleCreation(sampleMats[1], 'video', 'adult'),
    buildSampleCreation(sampleMats[2], 'exhibition', 'teenager'),
  ];
  sampleCreations.forEach((c, i) => {
    c.user_id = demoUser.id;
    c.created_at = new Date(Date.now() - (3 - i) * 24 * 60 * 60 * 1000).toISOString();
  });
  DB.setCreations([...creations, ...sampleCreations]);

  localStorage.setItem('ym_demo_seeded', 'true');
}

export function getDemoCredentials() {
  return { account: DEMO_USER.username, password: DEMO_USER.password };
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
