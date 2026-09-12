import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from '../app/App';
import { createMemoryAppRouter } from '../app/router';
import { MOCK_PRIVATE_IDENTITY } from '../mocks/demo-data';
import { createMockRoomGateway } from '../mocks/mock-room-gateway';
import { IDENTITY_REVEAL_TIMEOUT_MS } from './player/IdentityRevealCard';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  Reflect.deleteProperty(document, 'visibilityState');
});

function renderRoute(path: string) {
  return render(
    <App
      gateway={createMockRoomGateway({ delayMs: 0 })}
      appRouter={createMemoryAppRouter([path])}
    />,
  );
}

async function createHostRoom() {
  renderRoute('/host');
  await screen.findByRole('heading', { name: '配置模拟游戏' });
  fireEvent.click(screen.getByRole('button', { name: '确认配置并创建房间' }));
  return screen.findByText(/^\d{6}$/, { selector: '.room-code' });
}

async function openHostConfiguration() {
  renderRoute('/host');
  await screen.findByRole('heading', { name: '配置模拟游戏' });
}

async function joinPlayer() {
  renderRoute('/join');
  fireEvent.change(screen.getByLabelText('六位房间号'), {
    target: { value: '123456' },
  });
  fireEvent.change(screen.getByLabelText('昵称'), {
    target: { value: '阿蓝' },
  });
  fireEvent.click(screen.getByRole('button', { name: '加入模拟房间' }));
  await screen.findByRole('heading', { name: '6 号，准备看牌' });
}

describe('上帝 Mock 流程', () => {
  it('从首页点击我是上帝后直接进入配置界面', async () => {
    renderRoute('/');
    fireEvent.click(screen.getByRole('link', { name: /我是上帝/ }));

    expect(
      await screen.findByRole('heading', { name: '配置模拟游戏' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '选择人数' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '角色库' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Details · 地方规则' }),
    ).toBeInTheDocument();
  });

  it('可以通过快捷按钮或输入框选择 7 到 13 人', async () => {
    await openHostConfiguration();
    const countInput = screen.getByLabelText('玩家人数');

    fireEvent.click(screen.getByRole('button', { name: '12' }));
    expect(countInput).toHaveValue(12);

    fireEvent.change(countInput, { target: { value: '14' } });
    expect(screen.getByText('请输入 7 到 13 之间的整数。')).toBeInTheDocument();
    expect(countInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('置顶导航显示房间状态并可展开分区入口', async () => {
    await openHostConfiguration();
    const navigation = screen.getByRole('navigation', {
      name: '房间分区导航',
    });
    const toggle = within(navigation).getByRole('button', {
      name: /待创建.*前往分区/,
    });

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(navigation).getByRole('button', { name: /角色库/ }),
    ).toBeVisible();
    expect(
      within(navigation).getByRole('button', { name: /玩家与座位/ }),
    ).toBeVisible();
  });

  it('角色图按钮、加减号和移除操作会更新卡牌数量', async () => {
    await openHostConfiguration();
    const villagerCount = screen.getByLabelText('村民数量');

    expect(villagerCount).toHaveTextContent('3');
    fireEvent.click(screen.getByRole('button', { name: '添加一张村民' }));
    expect(villagerCount).toHaveTextContent('4');
    fireEvent.click(screen.getByRole('button', { name: '减少一张村民' }));
    expect(villagerCount).toHaveTextContent('3');
    fireEvent.click(screen.getByRole('button', { name: '移除全部村民' }));
    expect(villagerCount).toHaveTextContent('0');
    expect(
      screen.queryByRole('button', { name: '移除全部村民' }),
    ).not.toBeInTheDocument();
  });

  it('角色阵营可以各自折叠和展开', async () => {
    await openHostConfiguration();
    const villagerGroup = screen.getByRole('button', { name: /村民阵营/ });

    expect(villagerGroup).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(villagerGroup);
    expect(villagerGroup).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('button', { name: '添加一张村民' }),
    ).not.toBeInTheDocument();

    fireEvent.click(villagerGroup);
    expect(screen.getByRole('button', { name: '添加一张村民' })).toBeVisible();
  });

  it('按角色聚类规则，并只显示当前所选角色的草稿规则', async () => {
    await openHostConfiguration();

    expect(screen.getByText('狼人胜利方式')).toBeVisible();
    const seerRules = screen.getByRole('button', { name: /预言家相关规则/ });
    const witchRules = screen.getByRole('button', { name: /女巫相关规则/ });
    expect(seerRules).toHaveAttribute('aria-expanded', 'false');
    expect(witchRules).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(seerRules);
    fireEvent.click(witchRules);
    expect(screen.getByText('预言家查验结果')).toBeVisible();
    expect(screen.getByText('女巫同夜用药')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: '移除全部女巫' }));
    expect(screen.queryByText('女巫同夜用药')).not.toBeInTheDocument();
    expect(screen.getByText('预言家查验结果')).toBeInTheDocument();
  });

  it('调整玩家顺序后自动更新玩家序号', async () => {
    await openHostConfiguration();
    const playerList = screen.getByRole('list', {
      name: '已进入房间的玩家',
    });

    fireEvent.click(screen.getByRole('button', { name: '下移小满' }));
    const orderedPlayers = within(playerList).getAllByRole('listitem');
    expect(orderedPlayers[0]).toHaveTextContent('阿岚');
    expect(orderedPlayers[0]).toHaveTextContent('玩家序号 1');
    expect(orderedPlayers[1]).toHaveTextContent('小满');
    expect(orderedPlayers[1]).toHaveTextContent('玩家序号 2');
    expect(screen.getByText('小满已移至玩家序号 2。')).toBeVisible();
  });

  it('上帝可以输入玩家序号直接调整座位', async () => {
    await openHostConfiguration();
    const playerList = screen.getByRole('list', {
      name: '已进入房间的玩家',
    });

    fireEvent.change(screen.getByLabelText('小满的玩家序号'), {
      target: { value: '3' },
    });

    const orderedPlayers = within(playerList).getAllByRole('listitem');
    expect(orderedPlayers[0]).toHaveTextContent('阿岚');
    expect(orderedPlayers[1]).toHaveTextContent('北北');
    expect(orderedPlayers[2]).toHaveTextContent('小满');
    expect(screen.getByLabelText('小满的玩家序号')).toHaveValue(3);
    expect(screen.getByText('小满已移至玩家序号 3。')).toBeVisible();
  });

  it('确认配置后展示六位房间号和排序后的名单', async () => {
    const roomCode = await createHostRoom();

    expect(roomCode).toHaveTextContent(/^\d{6}$/);
    expect(screen.getByText('配置已保存')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '玩家顺序' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('已加入', { selector: '.joined-state' }),
    ).toHaveLength(9);
    expect(
      within(
        screen.getByRole('navigation', { name: '房间分区导航' }),
      ).getByText(roomCode.textContent ?? ''),
    ).toBeVisible();
  });

  it('创建后按阵营展示角色卡，并在可关闭弹窗中显示角色说明', async () => {
    await createHostRoom();

    expect(
      screen.getByRole('button', { name: '查看村民角色说明' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: '查看预言家角色说明' }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: '查看预言家角色说明' }),
    );

    const dialog = screen.getByRole('dialog', {
      name: '预言家 · 演示说明',
    });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(
      within(dialog).getByRole('heading', { name: '预言家 · 演示说明' }),
    ).toBeVisible();
    expect(within(dialog).getByText(/查验口径和行动顺序/)).toBeVisible();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('可以从房间返回游戏配置', async () => {
    await createHostRoom();
    fireEvent.click(screen.getByRole('button', { name: '返回游戏配置' }));
    expect(
      screen.getByRole('heading', { name: '配置模拟游戏' }),
    ).toBeInTheDocument();
  });

  it('剪贴板不可用时给出手动复制提示', async () => {
    await createHostRoom();
    fireEvent.click(screen.getByRole('button', { name: '复制房间号' }));

    expect(
      screen.getByText('当前浏览器不支持自动复制，请长按房间号手动复制。'),
    ).toBeInTheDocument();
  });
});

describe('玩家 Mock 流程', () => {
  it('拒绝不合法房间号并关联可见错误', () => {
    renderRoute('/join');
    const roomCodeInput = screen.getByLabelText('六位房间号');
    fireEvent.change(roomCodeInput, { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('昵称'), {
      target: { value: '阿蓝' },
    });
    fireEvent.click(screen.getByRole('button', { name: '加入模拟房间' }));

    const error = screen.getByText('请输入完整的 6 位数字房间号。');
    expect(error).toBeInTheDocument();
    expect(roomCodeInput).toHaveAttribute('aria-invalid', 'true');
    expect(roomCodeInput).toHaveAttribute('aria-describedby', error.id);
    expect(screen.queryByText('身份已经发放')).not.toBeInTheDocument();
  });

  it('合法加入后身份默认遮盖且 DOM 不含身份详情', async () => {
    await joinPlayer();

    expect(screen.getByText('你的身份已遮盖')).toBeInTheDocument();
    expect(screen.getAllByText('身份已经发放').length).toBeGreaterThan(0);
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.name),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.skillSummary),
    ).not.toBeInTheDocument();
  });

  it('玩家可以输入并保存自己的座位号', async () => {
    await joinPlayer();
    const seatInput = screen.getByLabelText('新的座位号');

    fireEvent.change(seatInput, { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: '保存座位号' }));

    expect(
      await screen.findByRole('heading', { name: '8 号，准备看牌' }),
    ).toBeVisible();
    expect(screen.getByText('座位号已调整为 8 号。')).toBeVisible();
  });

  it('主动查看后展示模拟身份详情', async () => {
    await joinPlayer();
    fireEvent.click(screen.getByRole('button', { name: '查看我的身份' }));

    expect(
      screen.getByRole('heading', { name: MOCK_PRIVATE_IDENTITY.name }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_PRIVATE_IDENTITY.factionLabel),
    ).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_PRIVATE_IDENTITY.skillSummary),
    ).toBeInTheDocument();
    expect(screen.getByText('规则说明')).toBeInTheDocument();
  });

  it('主动隐藏后从 DOM 移除角色名称和技能', async () => {
    await joinPlayer();
    fireEvent.click(screen.getByRole('button', { name: '查看我的身份' }));
    fireEvent.click(screen.getByRole('button', { name: '隐藏身份' }));

    expect(screen.getByText('你已主动隐藏身份。')).toBeInTheDocument();
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.name),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.skillSummary),
    ).not.toBeInTheDocument();
  });

  it('展示超时后自动隐藏并清除身份详情', async () => {
    await joinPlayer();
    vi.useFakeTimers();
    fireEvent.click(screen.getByRole('button', { name: '查看我的身份' }));

    act(() => {
      vi.advanceTimersByTime(IDENTITY_REVEAL_TIMEOUT_MS);
    });

    expect(
      screen.getByText('展示已超时，身份已自动隐藏。'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.name),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.skillSummary),
    ).not.toBeInTheDocument();
  });

  it('document hidden 时自动隐藏身份', async () => {
    await joinPlayer();
    fireEvent.click(screen.getByRole('button', { name: '查看我的身份' }));
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(
      screen.getByText('页面进入后台，身份已自动隐藏。'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.name),
    ).not.toBeInTheDocument();
  });

  it('window blur 时自动隐藏身份', async () => {
    await joinPlayer();
    fireEvent.click(screen.getByRole('button', { name: '查看我的身份' }));

    act(() => {
      window.dispatchEvent(new Event('blur'));
    });

    expect(
      screen.getByText('窗口失去焦点，身份已自动隐藏。'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(MOCK_PRIVATE_IDENTITY.name),
    ).not.toBeInTheDocument();
  });
});

it('未知路由提供友好返回入口', () => {
  renderRoute('/not-a-room');

  expect(
    screen.getByRole('heading', { name: '这里没有正在演示的页面' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '返回首页' })).toHaveAttribute(
    'href',
    '/',
  );
});
