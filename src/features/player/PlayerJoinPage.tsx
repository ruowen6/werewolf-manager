import { Link } from 'react-router-dom';

import { PageCard } from '../../components/PageCard';

export function PlayerJoinPage() {
  return (
    <PageCard
      eyebrow="玩家端"
      title="加入房间"
      description="加入表单将在房间接口完成后接入，这里不会模拟不安全的纯前端房间。"
    >
      <div className="placeholder-panel">
        <strong>等待后端房间能力</strong>
        <span>玩家身份数据只会通过受 RLS 保护的接口返回。</span>
      </div>
      <Link className="text-link" to="/">
        返回首页
      </Link>
    </PageCard>
  );
}
