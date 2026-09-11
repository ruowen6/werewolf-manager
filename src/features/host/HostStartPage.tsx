import { Link } from 'react-router-dom';

import { PageCard } from '../../components/PageCard';

export function HostStartPage() {
  return (
    <PageCard
      eyebrow="上帝端"
      title="创建房间"
      description="房间创建与实时玩家管理将在第一个功能迭代接入 Supabase。"
    >
      <div className="placeholder-panel">
        <strong>骨架已就绪</strong>
        <span>下一步：创建房间命令、临时凭证与玩家名单。</span>
      </div>
      <Link className="text-link" to="/">
        返回首页
      </Link>
    </PageCard>
  );
}
