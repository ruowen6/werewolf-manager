import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../../app/App';
import { createMemoryAppRouter } from '../../../app/router';
import { createMockRoomGateway } from '../../../mocks/mock-room-gateway';
import { NightDemoPage } from './NightDemoPage';

beforeEach(() => {
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});

function renderRoute(path: string) {
  return render(
    <App
      gateway={createMockRoomGateway({ delayMs: 0 })}
      appRouter={createMemoryAppRouter([path])}
    />,
  );
}

function confirmIntro() {
  fireEvent.click(
    screen.getByRole('checkbox', {
      name: /现场已经安静，所有玩家已闭眼/,
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: '开始夜间流程' }));
}

function chooseSeat(seatNumber: number) {
  const target = screen.getByRole('button', {
    name: new RegExp(`^${seatNumber}(?!\\d)`),
  });
  fireEvent.click(target);
  return target;
}

function continueWithCurrentTarget() {
  fireEvent.click(screen.getByRole('button', { name: /确认并继续 ·/ }));
}

function reachSeer() {
  confirmIntro();
  chooseSeat(3);
  continueWithCurrentTarget();
  chooseSeat(4);
  continueWithCurrentTarget();
}

function revealSeer() {
  reachSeer();
  chooseSeat(5);
  fireEvent.click(screen.getByRole('button', { name: /确认查验 ·/ }));
}

function reachWitch() {
  revealSeer();
  fireEvent.click(screen.getByRole('button', { name: '已完成手势，继续' }));
}

function reachResolution() {
  reachWitch();
  fireEvent.click(screen.getByLabelText(/今夜不用药/));
  fireEvent.click(screen.getByRole('button', { name: /确认今夜不用药并继续/ }));
  fireEvent.click(screen.getByRole('checkbox', { name: /已确认所有角色闭眼/ }));
  fireEvent.click(screen.getByRole('button', { name: '查看结算预览' }));
}

describe('上帝夜间演示', () => {
  it('可以从创建后的模拟房间进入夜间演示', async () => {
    renderRoute('/host');
    await screen.findByRole('heading', { name: '配置模拟游戏' });
    fireEvent.click(screen.getByRole('button', { name: '确认配置并创建房间' }));

    const entry = await screen.findByRole('link', { name: /开始夜间演示/ });
    expect(entry).toHaveAttribute('href', '/host/night-demo');
    fireEvent.click(entry);

    expect(screen.getByRole('heading', { name: '天黑请闭眼。' })).toBeVisible();
  });

  it('直接进入时展示第一夜和正确进度', () => {
    renderRoute('/host/night-demo');

    expect(screen.getByText('第一夜 · 演示模式')).toBeVisible();
    expect(screen.getByText('1 / 8')).toBeVisible();
    expect(screen.getByLabelText('步骤 1，共 8 步')).toBeInTheDocument();
    expect(screen.getByText('演示步骤，不代表最终规则顺序')).toBeVisible();
  });

  it('必需目标未选择时不能继续，合法目标选中后可以继续', () => {
    renderRoute('/host/night-demo');
    confirmIntro();

    expect(screen.getByRole('button', { name: '确认并继续' })).toBeDisabled();
    expect(screen.getByText('还差一步：请选择一名可选玩家。')).toBeVisible();

    chooseSeat(3);
    const confirm = screen.getByRole('button', { name: /确认并继续 · 3 号/ });
    expect(confirm).toBeEnabled();
    fireEvent.click(confirm);
    expect(
      screen.getByRole('heading', { name: '狼人 · 确认袭击目标' }),
    ).toBeVisible();
  });

  it('禁选和死亡玩家不能成为目标，并提供原因', () => {
    renderRoute('/host/night-demo');
    confirmIntro();

    const disabled = screen.getByRole('button', { name: /^2(?!\d)/ });
    const dead = screen.getByRole('button', { name: /^10(?!\d)/ });
    expect(disabled).toBeDisabled();
    expect(dead).toBeDisabled();
    expect(screen.getByText('演示限制：本夜不可连续守护该座位')).toBeVisible();
    expect(screen.getByText('已死亡，不可选择')).toBeVisible();
  });

  it('上一步返回后保留此前目标选择', () => {
    renderRoute('/host/night-demo');
    confirmIntro();
    chooseSeat(3);
    continueWithCurrentTarget();
    fireEvent.click(screen.getByRole('button', { name: '上一步' }));

    expect(screen.getByRole('button', { name: /^3(?!\d)/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByText('将记录 3 号 · 北北')).toBeVisible();
  });

  it('重复提示会重新聚焦主持词并产生可访问反馈', async () => {
    renderRoute('/host/night-demo');
    fireEvent.click(screen.getByRole('button', { name: '重复提示' }));

    const prompt = screen.getByRole('heading', { name: '天黑请闭眼。' });
    await waitFor(() => expect(prompt).toHaveFocus());
    expect(
      screen.getByText('主持词已重新突出：天黑请闭眼。'),
    ).toBeInTheDocument();
  });

  it('允许跳过的行动需要二次确认', () => {
    renderRoute('/host/night-demo');
    confirmIntro();
    fireEvent.click(screen.getByRole('button', { name: '跳过' }));

    const dialog = screen.getByRole('dialog', { name: '确定要放弃守护吗？' });
    expect(dialog).toBeVisible();
    fireEvent.click(
      within(dialog).getByRole('button', { name: '确认放弃守护' }),
    );
    expect(
      screen.getByRole('heading', { name: '狼人 · 确认袭击目标' }),
    ).toBeVisible();
    expect(
      screen.getAllByText('已确认跳过，并保留返回修改入口').length,
    ).toBeGreaterThan(0);
  });

  it('预言家演示结果只在目标确认后显示', () => {
    renderRoute('/host/night-demo');
    reachSeer();
    chooseSeat(5);

    expect(screen.queryByText('演示结果 · 好人')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /确认查验 ·/ }));
    expect(screen.getByText('演示结果 · 好人')).toBeVisible();
    expect(screen.getByText('仅上帝当前步骤可见')).toBeVisible();
    expect(
      screen.getByRole('button', { name: '已完成手势，继续' }),
    ).toBeEnabled();
  });

  it('女巫步骤分开呈现资源、狼刀信息和毒药目标', () => {
    renderRoute('/host/night-demo');
    reachWitch();

    expect(screen.getByText('模拟狼刀目标')).toBeVisible();
    expect(screen.getByText('4 号 · 柚子')).toBeVisible();
    expect(screen.getByLabelText('演示药剂剩余次数')).toHaveTextContent(
      '解药1次剩余毒药1次剩余',
    );
    fireEvent.click(screen.getByLabelText(/使用毒药/));
    expect(screen.getByText('还差一步：请选择毒药目标。')).toBeVisible();
    chooseSeat(7);
    expect(
      screen.getByRole('button', { name: '确认使用毒药 · 7 号并继续' }),
    ).toBeEnabled();
  });

  it('结算页明确分离上帝内部记录与建议公开信息', () => {
    renderRoute('/host/night-demo');
    reachResolution();

    expect(screen.getByRole('heading', { name: '仅上帝可见' })).toBeVisible();
    expect(screen.getByRole('heading', { name: '建议公开' })).toBeVisible();
    expect(screen.getByText('狼人记录')).toBeVisible();
    expect(screen.getByText('天亮后建议宣布')).toBeVisible();
  });

  it('完成后重新开始会回到第一步并清除上一轮选择', () => {
    renderRoute('/host/night-demo');
    reachResolution();
    fireEvent.click(screen.getByRole('button', { name: '确认结算预览' }));
    fireEvent.click(screen.getByRole('button', { name: '重新体验第一夜' }));

    expect(screen.getByText('1 / 8')).toBeVisible();
    expect(
      screen.getByRole('checkbox', {
        name: /现场已经安静，所有玩家已闭眼/,
      }),
    ).not.toBeChecked();
    expect(screen.getByRole('button', { name: '开始夜间流程' })).toBeDisabled();
  });

  it('无效步骤数据会显示安全错误界面', () => {
    render(
      <MemoryRouter>
        <NightDemoPage steps={[]} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: '这一夜的步骤没有准备好' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: '返回模拟房间' })).toBeVisible();
  });
});
