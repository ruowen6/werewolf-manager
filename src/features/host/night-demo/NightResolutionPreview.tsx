import { NIGHT_DEMO_PLAYERS } from '../../../mocks/night-demo/data';
import type { NightDemoAnswers } from '../../../mocks/night-demo/types';

function playerLabel(playerId?: string) {
  const player = NIGHT_DEMO_PLAYERS.find(
    (candidate) => candidate.id === playerId,
  );
  return player ? `${player.seatNumber} 号 · ${player.nickname}` : '未选择';
}

function witchRecord(answers: NightDemoAnswers) {
  if (answers.witchChoice === 'antidote') {
    return `使用解药 · 模拟救起 ${playerLabel(answers.wolfTargetId)}`;
  }
  if (answers.witchChoice === 'poison') {
    return `使用毒药 · ${playerLabel(answers.witchPoisonTargetId)}`;
  }
  return '未使用药剂';
}

function getPublicResult(answers: NightDemoAnswers) {
  const deaths = new Set<string>();

  if (
    answers.wolfTargetId &&
    answers.witchChoice !== 'antidote' &&
    answers.wolfTargetId !== answers.guardTargetId
  ) {
    deaths.add(answers.wolfTargetId);
  }
  if (answers.witchChoice === 'poison' && answers.witchPoisonTargetId) {
    deaths.add(answers.witchPoisonTargetId);
  }

  return deaths.size > 0
    ? Array.from(deaths).map(playerLabel).join('、')
    : '平安夜';
}

export function NightResolutionPreview({
  answers,
}: {
  answers: NightDemoAnswers;
}) {
  const publicResult = getPublicResult(answers);
  const wolfRecord = answers.wolfSkipped
    ? '空刀（手动跳过）'
    : playerLabel(answers.wolfTargetId);
  const guardRecord = answers.guardSkipped
    ? '放弃守护（手动跳过）'
    : playerLabel(answers.guardTargetId);

  return (
    <div className="resolution-layers">
      <section
        className="resolution-card resolution-card--private"
        aria-labelledby="private-resolution-title"
      >
        <header>
          <span className="privacy-key" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 11h14v9H5v-9Zm3 0V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <div>
            <p>INTERNAL RECORD</p>
            <h2 id="private-resolution-title">仅上帝可见</h2>
          </div>
        </header>
        <dl className="resolution-list">
          <div>
            <dt>狼人记录</dt>
            <dd>{wolfRecord}</dd>
          </div>
          <div>
            <dt>守护记录</dt>
            <dd>{guardRecord}</dd>
          </div>
          <div>
            <dt>查验记录</dt>
            <dd>{playerLabel(answers.seerTargetId)} · 演示为好人</dd>
          </div>
          <div>
            <dt>用药记录</dt>
            <dd>{witchRecord(answers)}</dd>
          </div>
          <div className="resolution-reason">
            <dt>模拟结果原因</dt>
            <dd>
              {publicResult === '平安夜'
                ? '演示记录中没有产生有效死亡：可能被守护、解药抵消或狼人空刀。'
                : '根据本页演示选择汇总死亡座位；未调用正式规则引擎。'}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="resolution-card resolution-card--public"
        aria-labelledby="public-resolution-title"
      >
        <header>
          <span className="announcement-key" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m4 14 11-5v10L4 14Zm11-5 4-3v16l-4-3M6 15l2 5" />
            </svg>
          </span>
          <div>
            <p>DAWN ANNOUNCEMENT</p>
            <h2 id="public-resolution-title">建议公开</h2>
          </div>
        </header>
        <div className="public-result">
          <span>天亮后建议宣布</span>
          <strong>{publicResult}</strong>
        </div>
        <p>次日只公布必要的座位结果，不公开角色行动来源与内部结算原因。</p>
      </section>
    </div>
  );
}
