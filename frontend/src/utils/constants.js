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
