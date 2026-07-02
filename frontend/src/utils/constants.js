// frontend/src/utils/constants.js
export const MATERIAL_TYPES = [
  { value: 'ancient_book', label: '古籍原文', icon: '📖' },
  { value: 'craft_text', label: '非遗工艺文字', icon: '🏺' },
  { value: 'oral_record', label: '口述记录', icon: '🎙️' },
  { value: 'craft_keyword', label: '工艺关键词', icon: '🔑' },
];

export const SCENARIOS = [
  { value: 'classroom', label: '课堂教学', icon: '📚', desc: '教案、知识卡片、互动问答、作业' },
  { value: 'exhibition', label: '展馆展览', icon: '🏛️', desc: '展板文案、说明牌、导览词、引导语' },
  { value: 'video', label: '短视频宣传', icon: '🎬', desc: '分镜脚本、口播文案、字幕、封面' },
  { value: 'study_tour', label: '研学活动', icon: '🎒', desc: '手册、体验活动、任务卡、安全须知' },
];

export const AUDIENCES = [
  { value: 'child', label: '儿童', desc: '6-12岁' },
  { value: 'teenager', label: '青少年', desc: '13-18岁' },
  { value: 'adult', label: '成人', desc: '普通受众' },
  { value: 'expert', label: '专家', desc: '专业研究者' },
];

export const SCENARIO_LABELS = {
  classroom: '课堂教学',
  exhibition: '展馆展览',
  video: '短视频宣传',
  study_tour: '研学活动',
};

export const AUDIENCE_LABELS = {
  child: '儿童',
  teenager: '青少年',
  adult: '成人',
  expert: '专家',
};

// 场景横幅图片
const BASE = import.meta.env.BASE_URL || '/';
export const SCENARIO_BANNERS = {
  classroom: `${BASE}images/banner-classroom.jpg`,
  exhibition: `${BASE}images/banner-exhibition.jpg`,
  video: `${BASE}images/banner-video.jpg`,
  study_tour: `${BASE}images/banner-study-tour.jpg`,
};

// 素材类型配图
export const MATERIAL_IMAGES = {
  ancient_book: `${BASE}images/mat-ancient-book.jpg`,
  craft_text: `${BASE}images/mat-craft-text.jpg`,
  oral_record: `${BASE}images/mat-oral-record.jpg`,
  craft_keyword: `${BASE}images/mat-craft-keyword.jpg`,
};

// 工艺图谱节点类型样式
export const CRAFT_NODE_STYLES = {
  material: { label: '原料', icon: '🟦', color: 'from-blue-400 to-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
  action: { label: '工序', icon: '🔶', color: 'from-amber-400 to-orange-500', text: 'text-orange-600', bg: 'bg-amber-50', border: 'border-amber-300' },
  product: { label: '成品', icon: '🟩', color: 'from-green-400 to-emerald-500', text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' },
};

/**
 * 生成工艺图谱节点图片 URL（使用 Pollinations.ai 免费生图服务）
 * 无需 API key，URL 即图片，浏览器加载时自动生成
 */
export function generateNodeImageUrl(node, index = 0) {
  const typeMap = {
    material: 'traditional Chinese craft raw material',
    action: 'traditional Chinese craft process step',
    product: 'traditional Chinese craft finished product',
  };
  const typeDesc = typeMap[node.node_type] || 'traditional Chinese craft';
  const desc = (node.description || '').slice(0, 80);
  const prompt = `${typeDesc}: ${node.label}. ${desc}. realistic, detailed, traditional Chinese style, illustration`;
  const encoded = encodeURIComponent(prompt);
  const seed = (index + 1) * 42;
  return `https://image.pollinations.ai/prompt/${encoded}?width=400&height=300&nologo=true&seed=${seed}`;
}

// 内容条目图标
export const CONTENT_ITEM_ICONS = {
  lesson_plan: '📋',
  knowledge_card: '🎴',
  interactive_qa: '❓',
  homework: '📝',
  exhibit_text: '🖼️',
  display_card: '🏷️',
  audio_guide: '🎧',
  visitor_guide: '🚶',
  storyboard: '🎬',
  voiceover: '🎤',
  subtitle: '💬',
  cover_copy: '📰',
  handbook: '📖',
  activity_design: '🎨',
  task_card: '✅',
  safety_notice: '⚠️',
};

// 示例素材（供创作页一键填充）
export const SAMPLE_MATERIAL_PRESETS = [
  {
    title: '《天工开物·陶埏》片段',
    material_type: 'ancient_book',
    content: '宋子曰：水火既济而土合。成器天下之前，始于炊爨之所需。大垔之未陶也，有虞氏之尚瓦棺也，夏后氏之垔周也。陶成雅器，有素肌玉骨之象焉。掩映几筵，文明可掬。岂固糠秕而已哉？凡陶之家，以茅苫前门，不得有窗棂。盖陶家忌明暗，茅屋取其气不散也。掘地深二尺，取细土和泥，蹂践使柔韧。过筛去其粗砾，渍水经宿，乃可制器。其器大小不等，大者缸瓮，小者碗碟。轮车既转，两手掬泥置于车盘之上，拇指中指插入，随转随开，遂成碗形。稍干修削，入窑烧之。柴薪累叠，火候足则止。',
  },
  {
    title: '景德镇手工制瓷七十二道工序',
    material_type: 'craft_text',
    content: '景德镇手工制瓷工艺始载于宋代，至明清趋于鼎盛，完整工序多达七十二道，概括为：\n\n一、练泥：取高岭土与瓷石，经粉碎、淘洗、沉淀、揉练，使泥料柔韧均匀。\n\n二、拉坯：将泥团置于辘轳车盘中央，双手随轮旋转，以拇指开孔，手指挤压成形。\n\n三、印坯：对不规则器形，以刻有纹样的模具印压泥片，合模成形。\n\n四、晒坯：将坯体置于晾坯架上，阴干至适当硬度。\n\n五、修坯：以铁刀旋削坯体内外，使其厚薄均匀、表面光洁。\n\n六、画坯：用青花料或釉里红在素坯上描绘纹饰。\n\n七、施釉：将坯体浸入釉浆，或浇釉、吹釉。\n\n八、烧窑：装入匣钵，入窑码放，以松柴为燃料，升温至一千三百度。\n\n九、开窑：冷却后开窑取出，拣选合格成品。\n\n每一步皆需匠人凭经验判断火候、厚薄、釉色，代代口传心授，方得"白如玉、明如镜、薄如纸、声如磬"之景德镇瓷。',
  },
  {
    title: '皮影戏传承人口述记录',
    material_type: 'oral_record',
    content: `【受访人：王师傅，陕西华县皮影戏省级传承人，从艺四十五年】\n\n"我这皮影啊，是跟我师父学的。我师父叫李德茂，他师父的师父，那都追溯到清朝光绪年间了。我十二岁开始学，那时候就是跟着师父走村串乡，晚上搭个幕布，点上汽灯，就开始唱了。\n\n皮影的皮子，必须用上好的牛皮，泡水、刮薄、晾干，一张皮子处理下来得半个月。刻的时候用三十多把刻刀，最小的刀比绣花针还细。一个人物头茬，光刻就得三天。刻完再上色，红、绿、黑、黄，用的都是矿物颜料，几十年不褪色。\n\n唱腔是老腔，跟秦腔不一样，我们叫碗碗腔。一台戏四个人，签手、前声、上档、下档，四个人撑一台戏。\n\n现在最大的难处是没人学。我就怕这手艺断在我手里，那对不起师父，也对不起祖宗传下来的东西。"`,
  },
  {
    title: '蓝印花布工艺关键词',
    material_type: 'craft_keyword',
    content: '蓝印花布、刻板、刮浆、染色、晾晒、靛蓝、防染、黄豆浆、桐油纸、漏印、冰裂纹、青白对比、民间印染、南通、染坊、镂空花版、蓝草、发酵染缸、氧化还原、传统纹样、吉祥图案、凤戏牡丹、麒麟送子、鲤鱼跳龙门',
  },
];
