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

function mockContent(scenario, content, audience) {
  const snippet = (content || '素材内容').slice(0, 20);
  const aud = audience || 'adult';

  // 受众风格适配
  const styleMap = {
    child: { tone: '小朋友们', level: '用简单有趣的语言，适合6-12岁儿童理解', vocab: '浅显易懂', qaHint: '用孩子能懂的方式回答' },
    teenager: { tone: '同学们', level: '适合中学生理解，可适度使用专业术语并解释', vocab: '中等深度', qaHint: '引导思考，适合中学生' },
    adult: { tone: '各位游客/读者', level: '语言专业流畅，适合普通成人受众', vocab: '专业准确', qaHint: '回答详实有深度' },
    expert: { tone: '各位专家/研究者', level: '使用专业术语，提供学术深度', vocab: '学术级', qaHint: '回答需具备学术参考价值' },
  };
  const s = styleMap[aud] || styleMap.adult;

  const templates = {
    classroom: `## 教案大纲

**教学目标：**
1. 了解「${snippet}...」的文化背景与历史价值
2. 掌握核心工艺流程与关键知识点
3. 培养对传统文化的兴趣与保护意识

**教学对象：** ${s.tone}（${s.level}）
**重点难点：**
- 重点：理解工艺步骤的先后逻辑
- 难点：古文术语的${s.vocab}转化理解

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
**A：** ${aud === 'child' ? '很久很久以前，我们的祖先就开始做这个东西啦！它已经传了很多很多年。' : aud === 'expert' ? '据考古发现与文献考证，该工艺起源甚早，历经多代发展演变，具有重要的器物学与工艺史研究价值。' : '根据史料记载，该工艺历史悠久，体现了古人的智慧与创造力。'}

**Q2：** 工艺中最关键的步骤是什么？
**A：** ${aud === 'child' ? '每一步都很重要哦！就像搭积木一样，少一块都不行。' : aud === 'expert' ? '从工艺学角度分析，核心工序对成品理化性能起决定性作用，其技术参数与操作规范值得深入考察。' : '每个步骤都不可或缺，但核心环节决定了最终成品的质量。'}

**Q3：** 现代生活中如何传承这项工艺？
**A：** ${aud === 'child' ? '可以和爸爸妈妈一起去体验，或者在学校的手工课上试一试！' : aud === 'expert' ? '建议从非遗保护、活态传承、数字化记录及产学研结合等维度构建系统性传承体系。' : '可以通过体验活动、文创产品等方式让更多人了解和参与。'}

## 课后作业建议

1. **实践作业：** ${aud === 'child' ? '回家和爸爸妈妈一起，用橡皮泥试试做一个小作品' : '尝试用简易材料模拟工艺流程中的一个步骤'}
2. **调研作业：** ${aud === 'child' ? '问问爷爷奶奶，他们小时候见过这种手艺吗？' : '查找本地类似的非遗项目并撰写简短报告'}
3. **创意作业：** ${aud === 'child' ? '画一幅关于这项手艺的画，下节课分享给大家' : '设计一份推广该项工艺的宣传海报'}`,

    exhibition: `## 展板文案

**千年匠心·${snippet.slice(0, 15)}...**

${aud === 'child' ? '小朋友们看！这是古时候的人做的宝贝，已经传了好久好久了。每一件都是匠人伯伯一点一点做出来的哦！' : aud === 'expert' ? '本展区系统呈现该项工艺的技法谱系、材料工艺与文化脉络，涵盖考古实物、文献档案及当代传承案例，为研究者提供多维度的学术参照。' : '本展区展示了中国传统工艺的精湛技艺与深厚文化底蕴。从选材到成品，每一道工序都凝聚着匠人的心血与智慧，是中华文明生生不息的生动见证。'}

## 展品说明牌

**展品1：原料标本**
${aud === 'child' ? '这就是做宝贝用的石头和泥巴，摸一摸感受一下吧！' : '展示工艺所用原始材料，可见其天然纹理与质感特征。'}

**展品2：工具器具**
${aud === 'child' ? '这些是匠人伯伯用的工具，比爷爷奶奶的年纪还要大呢！' : '匠人使用的传统工具，每一件都有百年以上使用历史。'}

**展品3：工艺半成品**
${aud === 'child' ? '看！这是做到一半的样子，是不是很神奇？' : '展示制作过程中的中间形态，可直观了解工艺步骤。'}

## 语音导览词

${aud === 'child' ? '小朋友们，欢迎来到这里！你们看，这些漂亮的东西都是古时候的人做的。他们用很特别的办法，把泥巴和石头变成了宝贝。让我们一起去看看他们是怎么做的吧！' : aud === 'expert' ? '各位研究者，欢迎莅临本展区。本展览旨在呈现该工艺从原料采集到成品输出的完整技术链条，重点展示其工艺谱系的演变轨迹。展线按照工艺时序组织，兼顾材料学、人类学与非遗保护的多重视角，欢迎深入考察。' : '各位游客，欢迎来到本展区。您眼前所见的，是一项传承千年的中国传统工艺。让我们一同走进匠人的世界，感受指尖上的文化传承。从最初的原材料选择，到最终成品的呈现，每一个环节都承载着历史的记忆与文化的温度……'}

## 参观引导语

**入口处：** ${aud === 'child' ? '小朋友们排好队，跟着箭头走，看看古人的宝贝！' : '欢迎进入匠心世界，请沿箭头方向参观'}
**互动区：** ${aud === 'child' ? '这里可以动手玩一玩，感受做宝贝的乐趣！' : '欢迎亲手体验，感受工艺魅力'}
**出口处：** ${aud === 'child' ? '今天的参观结束啦，记得和爸爸妈妈分享你看到的故事哦！' : '感谢参观，文创产品可在商店选购'}`,

    video: `## 视频分镜脚本

**分镜1（0-5秒）：** 开场特写——工艺成品细节展示，暖色调灯光 | 转场：淡入
**分镜2（5-15秒）：** 全景——匠人工作场景，环境音 | 转场：切换
**分镜3（15-30秒）：** 中景——核心工艺步骤特写 | 转场：推移
**分镜4（30-45秒）：** 采访——匠人讲述传承故事 | 转场：切换
**分镜5（45-60秒）：** 蒙太奇——工艺流程快速剪辑 | 转场：叠化
**分镜6（60-75秒）：** 成品展示+字幕——文化价值总结 | 转场：淡出

## 口播文案

${aud === 'child' ? '小朋友们，你们知道吗？在很久很久以前，有一位手艺特别棒的匠人。他用泥巴和石头，做出了好多漂亮的宝贝。每一件宝贝，都有一个故事。让我们跟着镜头，一起去看看这些宝贝是怎么做出来的吧！' : aud === 'expert' ? '该项工艺作为中国传统手工艺的典型代表，其技术体系蕴含着丰富的材料学、热力学及美学知识。从原料选取的矿物学考量，到成型工艺的力学原理，再到烧制环节的热力学控制，每一道工序都体现着传统科技智慧的系统性。本片将从工艺人类学视角，系统记录这一非物质文化遗产的活态传承。' : '在中华大地上，有这样一项传承千年的工艺。它不仅仅是一门手艺，更是一段跨越时空的对话。从选材的那一刻起，匠人便与材料建立了默契。每一道工序，都是对传统的致敬。每一次打磨，都是对完美的追求。这，就是中国匠心……'}

## 字幕文案

${aud === 'child' ? '- 「看！古人的宝贝」\n- 「每一件都是故事」\n- 「一起来学手艺吧」\n- 「把故事带回家」' : '- 「千年传承 匠心独运」\n- 「每一件作品 都是时光的礼物」\n- 「传统工艺 现代守护」\n- 「让文化在手心延续」'}

## 封面建议文案

${aud === 'child' ? '方案1：「古人的宝贝真好看」\n方案2：「跟我学做手艺」\n方案3：「神奇的「${snippet.slice(0, 10)}...」' : '方案1：「千年工艺·一指匠心」\n方案2：「看见·非遗的力量」\n方案3：「手艺中国——${snippet.slice(0, 10)}...」'}`,

    study_tour: `## 研学手册大纲

**活动主题：** 探秘传统工艺——${snippet.slice(0, 15)}...研学之旅
**研学对象：** ${s.tone}（${s.level}）
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
${aud === 'child' ? '老师会给大家看不同的小石头和泥土，猜猜哪个是用来做宝贝的？答对有奖哦！' : '提供多种原料样本，学生通过观察、触摸、闻味等方式辨识正确原料，培养感知能力。'}

**活动2：工序体验**
${aud === 'child' ? '在老师帮助下，每位小朋友亲手捏一个小作品，带回家给爸爸妈妈看！' : '在匠人指导下，学生亲手完成工艺中的一个简单步骤，体验匠人精神。'}

## 研学任务卡

**任务1：** ${aud === 'child' ? '数一数，这项手艺一共有几步？画下来告诉老师' : '记录工艺流程中的5个关键步骤，并标注每步的作用'}
**任务2：** ${aud === 'child' ? '问问匠人伯伯，他是从几岁开始学手艺的？' : '采访一位匠人，记录他学习工艺的故事'}
**任务3：** ${aud === 'child' ? '用彩笔画出你觉得最漂亮的成品' : '绘制该项工艺的思维导图'}
**任务4：** ${aud === 'child' ? '想想看，怎么让更多小朋友知道这项手艺？' : '提出一个让传统工艺走进现代生活的创意方案'}
**任务5：** ${aud === 'child' ? '说一句你最想说的话，老师帮你记下来' : '撰写一段100字的研学感悟'}

## 安全须知

1. ${aud === 'child' ? '小朋友要戴好手套，不要碰热的东西和尖尖的工具哦' : '体验活动时请佩戴防护手套，避免直接接触高温或锋利工具'}
2. ${aud === 'child' ? '要听老师的话，老师没说可以做的不能自己做' : '听从匠人指导，未经允许不得擅自操作设备'}
3. ${aud === 'child' ? '玩完的东西要放回原位，保持干净' : '保持活动区域整洁，工具用完归位'}
4. ${aud === 'child' ? '如果不舒服，马上告诉老师' : '如有不适请立即告知带队老师'}`,
  };
  return templates[scenario] || templates.classroom;
}

function mockCraftGraph(materialType, content) {
  const c = content || '';

  // 根据素材类型生成差异化工艺图谱
  const graphs = {
    ancient_book: {
      // 古籍通常记载陶/瓷/瓦等工艺
      nodes: [
        { node_id: 'step1', label: '取土选料', node_type: 'material', description: '掘地取无沙粘土，百里内必产合用土色', sort_order: 0 },
        { node_id: 'step2', label: '练泥陈腐', node_type: 'action', description: '调践熟泥，踩踏使柔韧均匀，渍水经宿', sort_order: 1 },
        { node_id: 'step3', label: '拉坯成型', node_type: 'action', description: '以圆桶为模，铁线弦弓割泥，周包圆桶', sort_order: 2 },
        { node_id: 'step4', label: '修坯晾干', node_type: 'action', description: '待稍干脱模而出，自然裂分，修削成型', sort_order: 3 },
        { node_id: 'step5', label: '装窑烧制', node_type: 'action', description: '堆积窑中燃薪举火，一至二昼夜视量定熄', sort_order: 4 },
        { node_id: 'step6', label: '浇水转釉', node_type: 'action', description: '停火后浇水使表面呈现光泽，与造砖同法', sort_order: 5 },
        { node_id: 'step7', label: '开窑取器', node_type: 'product', description: '冷却后开窑取出，成品瓦器可用于建筑', sort_order: 6 },
      ],
      edges: [
        { source_node: 'step1', target_node: 'step2', label: '经练制' },
        { source_node: 'step2', target_node: 'step3', label: '入成型' },
        { source_node: 'step3', target_node: 'step4', label: '待干燥' },
        { source_node: 'step4', target_node: 'step5', label: '入窑烧' },
        { source_node: 'step5', target_node: 'step6', label: '转釉色' },
        { source_node: 'step6', target_node: 'step7', label: '出成品' },
      ],
    },
    craft_text: {
      // 工艺文字通常描述完整流程
      nodes: [
        { node_id: 'step1', label: '采矿淘洗', node_type: 'material', description: '取高岭土与瓷石，经粉碎、淘洗、沉淀', sort_order: 0 },
        { node_id: 'step2', label: '练泥制不', node_type: 'action', description: '揉练使泥料柔韧均匀，陈腐以增可塑性', sort_order: 1 },
        { node_id: 'step3', label: '拉坯印坯', node_type: 'action', description: '辘轳车盘拉坯，或模具印压泥片合模', sort_order: 2 },
        { node_id: 'step4', label: '利坯修足', node_type: 'action', description: '铁刀旋削坯体内外，厚薄均匀表面光洁', sort_order: 3 },
        { node_id: 'step5', label: '画坯施釉', node_type: 'action', description: '青花料描绘纹饰，浸釉或吹釉均匀覆盖', sort_order: 4 },
        { node_id: 'step6', label: '装窑烧窑', node_type: 'action', description: '匣钵装坯，松柴升温至1300度，二十余小时', sort_order: 5 },
        { node_id: 'step7', label: '开窑选瓷', node_type: 'product', description: '冷却后拣选合格成品，白如玉明如镜', sort_order: 6 },
      ],
      edges: [
        { source_node: 'step1', target_node: 'step2', label: '经练制' },
        { source_node: 'step2', target_node: 'step3', label: '入成型' },
        { source_node: 'step3', target_node: 'step4', label: '待修整' },
        { source_node: 'step4', target_node: 'step5', label: '施装饰' },
        { source_node: 'step5', target_node: 'step6', label: '入窑烧' },
        { source_node: 'step6', target_node: 'step7', label: '出成品' },
      ],
    },
    oral_record: {
      // 口述记录通常涉及表演类非遗
      nodes: [
        { node_id: 'step1', label: '选皮处理', node_type: 'material', description: '选用上等驴皮/牛皮，泡水、刮薄、晾干', sort_order: 0 },
        { node_id: 'step2', label: '画稿过稿', node_type: 'action', description: '设计人物造型，将图样描画到皮面上', sort_order: 1 },
        { node_id: 'step3', label: '雕镂刻制', node_type: 'action', description: '三十余把刻刀精雕，最小刻刀细于绣花针', sort_order: 2 },
        { node_id: 'step4', label: '上色固色', node_type: 'action', description: '矿物颜料红绿黑白黄上色，数十年不褪', sort_order: 3 },
        { node_id: 'step5', label: '缀结装置', node_type: 'action', description: '关节处缀结竹签铁丝，连接操纵杆', sort_order: 4 },
        { node_id: 'step6', label: '排练演出', node_type: 'product', description: '签手操纵、前声演唱，幕布灯光下表演', sort_order: 5 },
      ],
      edges: [
        { source_node: 'step1', target_node: 'step2', label: '经处理' },
        { source_node: 'step2', target_node: 'step3', label: '入雕刻' },
        { source_node: 'step3', target_node: 'step4', label: '施色彩' },
        { source_node: 'step4', target_node: 'step5', label: '缀装置' },
        { source_node: 'step5', target_node: 'step6', label: '上舞台' },
      ],
    },
    craft_keyword: {
      // 关键词类素材（如蓝印花布/苏绣）
      nodes: [
        { node_id: 'step1', label: '选材备料', node_type: 'material', description: '选取蚕丝线/棉布底料/矿物染料等原材料', sort_order: 0 },
        { node_id: 'step2', label: '勾稿上绷', node_type: 'action', description: '设计图案勾稿，将底料上绷固定', sort_order: 1 },
        { node_id: 'step3', label: '核心工艺', node_type: 'action', description: '按传统技法进行刺绣/印染等核心制作', sort_order: 2 },
        { node_id: 'step4', label: '精细修整', node_type: 'action', description: '劈丝配色、分水勾线，精细打磨细节', sort_order: 3 },
        { node_id: 'step5', label: '落绷装裱', node_type: 'action', description: '完成制作后落绷，装裱成装饰画或团扇', sort_order: 4 },
        { node_id: 'step6', label: '成品检验', node_type: 'product', description: '质量检验，光感丝理达标即为成品', sort_order: 5 },
      ],
      edges: [
        { source_node: 'step1', target_node: 'step2', label: '经准备' },
        { source_node: 'step2', target_node: 'step3', label: '入制作' },
        { source_node: 'step3', target_node: 'step4', label: '转修整' },
        { source_node: 'step4', target_node: 'step5', label: '入装裱' },
        { source_node: 'step5', target_node: 'step6', label: '出成品' },
      ],
    },
  };

  return graphs[materialType] || graphs.ancient_book;
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

    const rawContent = mockContent(body.scenario, material.content, body.audience);
    const contentItems = parseContentItems(rawContent, body.scenario);
    const craftGraph = mockCraftGraph(material.material_type, material.content);

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
    const rawContent = mockContent(creation.scenario, material ? material.content : '', body.audience);
    const contentItems = parseContentItems(rawContent, creation.scenario);
    const craftGraph = mockCraftGraph(material ? material.material_type : 'ancient_book', material ? material.content : '');

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
  const rawContent = mockContent(scenario, material.content, audience);
  const contentItems = parseContentItems(rawContent, scenario);
  const craftGraph = mockCraftGraph(material.material_type, material.content);
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
