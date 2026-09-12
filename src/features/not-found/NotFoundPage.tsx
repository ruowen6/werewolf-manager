import { Link } from 'react-router-dom';

import { PageCard } from '../../components/PageCard';

export function NotFoundPage() {
  return (
    <PageCard
      tone="error"
      eyebrow="走错房间了"
      title="这里没有正在演示的页面"
      description="可以安全返回首页，重新选择上帝或玩家流程。"
    >
      <Link className="primary-button button-link" to="/">
        返回首页
      </Link>
    </PageCard>
  );
}
