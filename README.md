# Werewolf Manager

面向线下狼人杀的移动端 Web 上帝助手。应用负责建房、发牌、主持提词、事件记录与规则结算，玩家之间的发言、观察和操作仍在线下完成。

## 当前状态

项目处于 MVP 骨架阶段。首个版本只支持单身份基础局，目标角色为村民、狼人、守卫、预言家、女巫和猎人。

产品需求见 [`docs/requirements.md`](docs/requirements.md)，开发前的规则定稿请填写 [`docs/ruleset-template.md`](docs/ruleset-template.md)。

## 本地开发

要求 Node.js 22.12 或更高版本，推荐使用当前 LTS 版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

可用命令：

```bash
npm run dev        # 启动开发服务器
npm run build      # 类型检查并构建生产产物
npm run test       # 运行测试
npm run lint       # 运行静态检查
npm run format     # 检查代码格式
```

## 目录结构

```text
src/
  app/             应用入口、路由和全局布局
  components/      跨业务复用的 UI 组件
  domain/          与框架无关的游戏模型、状态机和规则契约
  features/        按玩家、上帝等业务能力组织的页面与逻辑
  infrastructure/  Supabase 等外部服务适配器
  styles/          全局样式与设计变量
  test/            测试环境配置
supabase/
  functions/       可信后端命令，例如安全发牌与关键结算
  migrations/      数据库结构、RLS 策略和清理任务
```

领域层不得依赖 React 或 Supabase。UI 通过领域命令驱动状态变化，后端负责权限校验、幂等控制和私密信息隔离。
