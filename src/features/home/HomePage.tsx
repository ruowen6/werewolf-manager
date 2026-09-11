import { Link } from 'react-router-dom';

import { PageCard } from '../../components/PageCard';

export function HomePage() {
  return (
    <PageCard
      eyebrow="线下面杀 · 移动端优先"
      title="今晚，交给程序记住规则"
      description="你负责观察现场和带动气氛，助手负责发牌、提词、记录与结算。"
    >
      <nav className="action-stack" aria-label="身份选择">
        <Link className="primary-action" to="/host">
          我是上帝
          <span>创建并主持游戏</span>
        </Link>
        <Link className="secondary-action" to="/join">
          我是玩家
          <span>输入房间号加入</span>
        </Link>
      </nav>
    </PageCard>
  );
}
