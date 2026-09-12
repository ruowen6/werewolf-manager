import type {
  HostConfigurationSetup,
  HostRoomSnapshot,
  PrivateIdentity,
} from '../domain/rooms/gateway';

export const MOCK_HOST_CONFIGURATION: HostConfigurationSetup = {
  defaultPlayerCount: 9,
  roles: [
    {
      id: 'villager',
      name: '村民',
      group: 'villager',
      symbol: '🧑‍🌾',
      summary: '普通民牌',
      description:
        '演示中的普通民牌。此处只说明角色分类，具体流程以正式规则集为准。',
      defaultCount: 3,
    },
    {
      id: 'guard',
      name: '守卫',
      group: 'god',
      symbol: '🛡️',
      summary: '保护型神职',
      description:
        '演示中的保护型神职。保护目标、限制和结算顺序仍以正式规则集为准。',
      defaultCount: 0,
    },
    {
      id: 'seer',
      name: '预言家',
      group: 'god',
      symbol: '🔮',
      summary: '信息型神职',
      description: '演示中的信息型神职。查验口径和行动顺序仍以正式规则集为准。',
      defaultCount: 1,
    },
    {
      id: 'witch',
      name: '女巫',
      group: 'god',
      symbol: '⚗️',
      summary: '药剂型神职',
      description: '演示中的药剂型神职。用药限制和效果结算仍以正式规则集为准。',
      defaultCount: 1,
    },
    {
      id: 'hunter',
      name: '猎人',
      group: 'god',
      symbol: '🏹',
      summary: '追击型神职',
      description:
        '演示中的追击型神职。技能触发条件与目标限制仍以正式规则集为准。',
      defaultCount: 1,
    },
    {
      id: 'wolf',
      name: '狼人',
      group: 'werewolf',
      symbol: '🐺',
      summary: '普通狼牌',
      description: '演示中的普通狼人牌。行动方式和胜利条件仍以正式规则集为准。',
      defaultCount: 2,
    },
    {
      id: 'wolf-king',
      name: '狼王',
      group: 'werewolf',
      symbol: '♛',
      summary: '特殊狼牌',
      description: '演示中的特殊狼人牌。死亡技能和结算限制仍以正式规则集为准。',
      defaultCount: 1,
    },
  ],
  ruleFields: [
    {
      id: 'victory-mode',
      label: '狼人胜利方式',
      description: '选择本局采用屠边或屠城判定。',
      sourceRuleId: 'RULE-BASE-001',
      defaultValue: 'eliminate-side',
      options: [
        {
          value: 'eliminate-side',
          label: '屠边',
          description: '神职或村民任一类别全部出局。',
        },
        {
          value: 'eliminate-all',
          label: '屠城',
          description: '所有好人全部出局。',
        },
      ],
    },
    {
      id: 'seer-result',
      label: '预言家查验结果',
      description: '决定上帝向预言家展示的信息粒度。',
      sourceRuleId: 'ROLE-SEER-003',
      relatedRoleId: 'seer',
      defaultValue: 'faction',
      options: [
        {
          value: 'faction',
          label: '仅显示阵营',
          description: '只显示好人或狼人。',
        },
        {
          value: 'role',
          label: '显示具体角色',
          description: '同时显示被查验者的角色。',
        },
      ],
    },
    {
      id: 'witch-same-night-use',
      label: '女巫同夜用药',
      description: '决定同一夜能否同时使用解药和毒药。',
      sourceRuleId: 'ROLE-WITCH-002',
      relatedRoleId: 'witch',
      defaultValue: 'one-potion',
      options: [
        {
          value: 'one-potion',
          label: '仅使用一种',
          description: '当夜只能选择解药或毒药。',
        },
        {
          value: 'both-potions',
          label: '可同时使用',
          description: '当夜允许两种药同时使用。',
        },
      ],
    },
    {
      id: 'witch-first-night-self-save',
      label: '女巫首夜自救',
      description: '女巫首夜被狼刀时是否可以使用解药救自己。',
      sourceRuleId: 'ROLE-WITCH-004',
      relatedRoleId: 'witch',
      defaultValue: 'allowed',
      options: [
        {
          value: 'allowed',
          label: '允许自救',
          description: '仅首夜允许使用解药自救。',
        },
        {
          value: 'not-allowed',
          label: '不允许自救',
          description: '首夜也不能使用解药救自己。',
        },
      ],
    },
    {
      id: 'witch-poison-vs-guard',
      label: '守护能否抵消毒药',
      description: '毒药目标当夜被守护时采用哪种结果。',
      sourceRuleId: 'ROLE-WITCH-006',
      relatedRoleId: 'witch',
      defaultValue: 'not-blocked',
      options: [
        {
          value: 'blocked',
          label: '可以抵消',
          description: '有效守护可以抵消毒药。',
        },
        {
          value: 'not-blocked',
          label: '不能抵消',
          description: '毒药不受守护影响。',
        },
      ],
    },
    {
      id: 'witch-poison-vs-antidote',
      label: '解药能否抵消毒药',
      description: '同一目标同时受到毒药与解药时采用哪种结果。',
      sourceRuleId: 'ROLE-WITCH-006',
      relatedRoleId: 'witch',
      defaultValue: 'not-blocked',
      options: [
        {
          value: 'blocked',
          label: '可以抵消',
          description: '有效解药可以抵消毒药。',
        },
        {
          value: 'not-blocked',
          label: '不能抵消',
          description: '毒药不受解药影响。',
        },
      ],
    },
  ],
  players: [
    { id: 'demo-player-1', nickname: '小满', seatNumber: 1 },
    { id: 'demo-player-2', nickname: '阿岚', seatNumber: 2 },
    { id: 'demo-player-3', nickname: '北北', seatNumber: 3 },
    { id: 'demo-player-4', nickname: '柚子', seatNumber: 4 },
    { id: 'demo-player-5', nickname: '小岛', seatNumber: 5 },
    { id: 'demo-player-6', nickname: '可乐', seatNumber: 6 },
    { id: 'demo-player-7', nickname: '十七', seatNumber: 7 },
    { id: 'demo-player-8', nickname: '糯米', seatNumber: 8 },
    { id: 'demo-player-9', nickname: '山竹', seatNumber: 9 },
  ],
};

export const MOCK_HOST_ROOM: HostRoomSnapshot = {
  code: '728314',
  statusLabel: '等待配置',
  players: [...MOCK_HOST_CONFIGURATION.players],
  configuration: {
    id: 'demo-single-eight-player',
    name: '八人演示板子',
    mode: 'single',
    playerCount: 9,
    roles: [
      {
        roleId: 'villager',
        name: '村民',
        group: 'villager',
        symbol: '🧑‍🌾',
        summary: '普通民牌',
        description:
          '演示中的普通民牌。此处只说明角色分类，具体流程以正式规则集为准。',
        count: 3,
      },
      {
        roleId: 'seer',
        name: '预言家',
        group: 'god',
        symbol: '🔮',
        summary: '信息型神职',
        description:
          '演示中的信息型神职。查验口径和行动顺序仍以正式规则集为准。',
        count: 1,
      },
      {
        roleId: 'witch',
        name: '女巫',
        group: 'god',
        symbol: '⚗️',
        summary: '药剂型神职',
        description:
          '演示中的药剂型神职。用药限制和效果结算仍以正式规则集为准。',
        count: 1,
      },
      {
        roleId: 'hunter',
        name: '猎人',
        group: 'god',
        symbol: '🏹',
        summary: '追击型神职',
        description:
          '演示中的追击型神职。技能触发条件与目标限制仍以正式规则集为准。',
        count: 1,
      },
      {
        roleId: 'wolf',
        name: '狼人',
        group: 'werewolf',
        symbol: '🐺',
        summary: '普通狼牌',
        description:
          '演示中的普通狼人牌。行动方式和胜利条件仍以正式规则集为准。',
        count: 2,
      },
      {
        roleId: 'wolf-king',
        name: '狼王',
        group: 'werewolf',
        symbol: '♛',
        summary: '特殊狼牌',
        description:
          '演示中的特殊狼人牌。死亡技能和结算限制仍以正式规则集为准。',
        count: 1,
      },
    ],
    checks: [
      '演示玩家 9 人，演示身份 9 张',
      '当前仅展示单身份配置布局',
      '未执行正式规则、强度或角色兼容性校验',
    ],
  },
};

export const MOCK_PRIVATE_IDENTITY: PrivateIdentity = {
  name: '预言家',
  factionLabel: '好人阵营 · 神职',
  skillSummary: '每晚可以查验一名玩家的阵营。',
  publicNotes: [
    '这是用于演示看牌交互的简化说明。',
    '行动顺序与查验口径以后续正式规则集为准。',
  ],
};
