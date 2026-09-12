import type { NightDemoAnswers, NightDemoPlayer, NightDemoStep } from './types';

export const NIGHT_DEMO_STEPS: readonly NightDemoStep[] = [
  {
    id: 'night-intro',
    kind: 'info',
    actorLabel: '夜晚开始',
    title: '让森林安静下来',
    hostPrompt: '天黑请闭眼。',
    guidance: '确认所有玩家已经闭眼，再开始本轮演示流程。',
    acknowledgementLabel: '现场已经安静，所有玩家已闭眼',
    tone: 'moon',
    allowSkip: false,
  },
  {
    id: 'guard-action',
    kind: 'target',
    action: 'guard',
    actorLabel: '守卫行动',
    title: '守卫 · 选择守护目标',
    hostPrompt: '守卫请睁眼。今晚你要守护谁？',
    guidance: '点选一名可选玩家，或记录本夜放弃守护。',
    emptyActionLabel: '放弃守护',
    tone: 'guard',
    allowSkip: true,
  },
  {
    id: 'wolf-action',
    kind: 'target',
    action: 'wolf',
    actorLabel: '狼人行动',
    title: '狼人 · 确认袭击目标',
    hostPrompt: '狼人请睁眼。请确认今晚的目标。',
    guidance: '禁选原因仅用于检验界面表达，不代表正式规则。',
    emptyActionLabel: '记录空刀',
    tone: 'wolf',
    allowSkip: true,
  },
  {
    id: 'seer-action',
    kind: 'reveal',
    action: 'seer',
    actorLabel: '预言家行动',
    title: '预言家 · 查验一名玩家',
    hostPrompt: '预言家请睁眼。今晚你要查验谁？',
    guidance: '选择并确认后，演示结果只会在上帝当前页面出现。',
    tone: 'seer',
    allowSkip: false,
  },
  {
    id: 'witch-action',
    kind: 'resource',
    action: 'witch',
    actorLabel: '女巫行动',
    title: '女巫 · 决定是否用药',
    hostPrompt: '女巫请睁眼。今晚他倒下了，你要使用药剂吗？',
    guidance: '演示中的用药次数和限制仅用于 UI 验证。',
    tone: 'witch',
    allowSkip: true,
  },
  {
    id: 'night-close',
    kind: 'info',
    actorLabel: '夜间结束',
    title: '行动已经记录',
    hostPrompt: '所有角色请闭眼。夜晚即将结束。',
    guidance: '确认现场已经恢复安静，再进入模拟结算预览。',
    acknowledgementLabel: '已确认所有角色闭眼',
    tone: 'dawn',
    allowSkip: false,
  },
  {
    id: 'resolution',
    kind: 'resolution',
    actorLabel: '结算预览',
    title: '先看清，再公布',
    hostPrompt: '请检查夜间记录与建议公开的信息。',
    guidance: '以下内容由演示选择生成，不是正式规则引擎的结算结果。',
    tone: 'summary',
    allowSkip: false,
  },
  {
    id: 'complete',
    kind: 'complete',
    actorLabel: '演示完成',
    title: '第一夜，顺利完成',
    hostPrompt: '做得好，今晚的每一步都记录下来了。',
    guidance: '正式版本将根据已确认规则接入状态机与结算引擎。',
    tone: 'complete',
    allowSkip: false,
  },
] as const;

export const NIGHT_DEMO_PLAYERS: readonly NightDemoPlayer[] = [
  {
    id: 'seat-1',
    seatNumber: 1,
    nickname: '小满',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-2',
    seatNumber: 2,
    nickname: '阿岚',
    status: 'available',
    disabledFor: { guard: '演示限制：本夜不可连续守护该座位' },
  },
  {
    id: 'seat-3',
    seatNumber: 3,
    nickname: '北北',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-4',
    seatNumber: 4,
    nickname: '柚子',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-5',
    seatNumber: 5,
    nickname: '小岛',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-6',
    seatNumber: 6,
    nickname: '可乐',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-7',
    seatNumber: 7,
    nickname: '十七',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-8',
    seatNumber: 8,
    nickname: '糯米',
    status: 'available',
    disabledFor: { wolf: '狼人同伴不可成为本次演示目标' },
  },
  {
    id: 'seat-9',
    seatNumber: 9,
    nickname: '山竹',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-10',
    seatNumber: 10,
    nickname: '小石',
    status: 'dead',
    disabledFor: {},
  },
  {
    id: 'seat-11',
    seatNumber: 11,
    nickname: '春生',
    status: 'available',
    disabledFor: {},
  },
  {
    id: 'seat-12',
    seatNumber: 12,
    nickname: '麦芽',
    status: 'available',
    disabledFor: { poison: '演示资源限制：该座位暂不可用毒' },
  },
] as const;

export const EMPTY_NIGHT_DEMO_ANSWERS: NightDemoAnswers = {
  introReady: false,
  guardSkipped: false,
  wolfSkipped: false,
  seerRevealed: false,
  nightClosed: false,
};

export const MOCK_WOLF_TARGET_ID = 'seat-4';

export function getDemoPlayer(playerId: string | undefined) {
  return NIGHT_DEMO_PLAYERS.find((player) => player.id === playerId);
}

export function getSeerDemoResult(playerId: string | undefined) {
  const player = getDemoPlayer(playerId);
  if (!player) return null;

  return {
    player,
    alignment: player.id === 'seat-8' ? '狼人阵营' : '好人阵营',
  };
}
