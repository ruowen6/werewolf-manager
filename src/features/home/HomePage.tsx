import { Link } from 'react-router-dom';

import { PageCard } from '../../components/PageCard';
import { ProductGlyph } from '../../components/ProductGlyph';

export function HomePage() {
  return (
    <PageCard
      tone="home"
      eyebrow="可点击 Mock · 演示模式"
      title="今晚，你坐哪一边？"
      description="选择身份即可走完模拟建房或私密看牌流程。这里不会创建真实房间。"
    >
      <nav className="action-stack" aria-label="身份选择">
        <Link className="primary-action" to="/host">
          <span className="action-visual" aria-hidden="true">
            <ProductGlyph name="host" />
          </span>
          <span className="action-copy">
            <strong>我是上帝</strong>
            <small>创建模拟房间</small>
          </span>
          <svg className="action-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
        <Link className="secondary-action" to="/join">
          <span className="action-visual" aria-hidden="true">
            <ProductGlyph name="player" />
          </span>
          <span className="action-copy">
            <strong>我是玩家</strong>
            <small>加入并查看模拟身份</small>
          </span>
          <svg className="action-arrow" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
      </nav>
    </PageCard>
  );
}
