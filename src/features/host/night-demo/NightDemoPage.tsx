import { useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { HostRoomSnapshot } from '../../../domain/rooms/gateway';
import { MOCK_HOST_ROOM } from '../../../mocks/demo-data';
import {
  NIGHT_DEMO_PLAYERS,
  NIGHT_DEMO_STEPS,
} from '../../../mocks/night-demo/data';
import type {
  NightDemoAnswers,
  NightDemoStep,
  WitchChoice,
} from '../../../mocks/night-demo/types';
import { HostPrompt } from './HostPrompt';
import { NightActionFooter } from './NightActionFooter';
import { NightIllustration } from './NightIllustration';
import { NightProgress } from './NightProgress';
import { NightResolutionPreview } from './NightResolutionPreview';
import { SeatTargetGrid } from './SeatTargetGrid';
import { SkipConfirmation } from './SkipConfirmation';

const EMPTY_ANSWERS: NightDemoAnswers = {
  introReady: false,
  guardSkipped: false,
  wolfSkipped: false,
  seerRevealed: false,
  nightClosed: false,
};

const VALID_STEP_KINDS = new Set([
  'info',
  'target',
  'reveal',
  'resource',
  'resolution',
  'complete',
]);

function isValidStep(step: NightDemoStep | undefined): step is NightDemoStep {
  return Boolean(
    step && step.id && step.hostPrompt && VALID_STEP_KINDS.has(step.kind),
  );
}

function getPlayer(playerId?: string) {
  return NIGHT_DEMO_PLAYERS.find((player) => player.id === playerId);
}

function targetButtonLabel(prefix: string, playerId?: string) {
  const player = getPlayer(playerId);
  return player
    ? `${prefix} ${player.seatNumber} 号 · ${player.nickname}`
    : prefix;
}

function RoleGuide({ guidance }: { guidance: string }) {
  return (
    <aside className="role-guide">
      <span aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 4a7 7 0 0 0-4 12.7V20h8v-3.3A7 7 0 0 0 12 4Zm-4 16h8M9 13h6" />
        </svg>
      </span>
      <div>
        <strong>演示提示</strong>
        <p>{guidance}</p>
      </div>
    </aside>
  );
}

function InfoAction({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`acknowledgement-card${checked ? ' is-checked' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="acknowledgement-check" aria-hidden="true">
        <svg viewBox="0 0 20 20">
          <path d="m4 10 4 4 8-9" />
        </svg>
      </span>
      <span>
        <strong>{label}</strong>
        <small>轻点确认后即可继续</small>
      </span>
    </label>
  );
}

interface DemoLocationState {
  room?: HostRoomSnapshot;
}

export function NightDemoPage({
  steps = NIGHT_DEMO_STEPS,
}: {
  steps?: readonly NightDemoStep[];
}) {
  const location = useLocation();
  const sourceRoom = (location.state as DemoLocationState | null)?.room;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<NightDemoAnswers>(EMPTY_ANSWERS);
  const [repeatKey, setRepeatKey] = useState(0);
  const [liveMessage, setLiveMessage] = useState('');
  const [skipOpen, setSkipOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const promptRef = useRef<HTMLHeadingElement>(null);
  const successTimer = useRef<number | undefined>(undefined);
  const step = steps[stepIndex];
  const totalSteps = steps.length;

  const selectedGuard = getPlayer(answers.guardTargetId);
  const selectedWolf = getPlayer(answers.wolfTargetId);
  const selectedSeer = getPlayer(answers.seerTargetId);
  const selectedPoison = getPlayer(answers.witchPoisonTargetId);

  const control = useMemo(() => {
    if (!step) return null;

    if (step.kind === 'info') {
      const checked =
        step.id === 'night-intro' ? answers.introReady : answers.nightClosed;
      return {
        disabled: !checked,
        requirement: checked
          ? '准备好了，继续吧。'
          : `请先确认：${step.acknowledgementLabel}`,
        primaryLabel:
          step.id === 'night-intro' ? '开始夜间流程' : '查看结算预览',
      };
    }

    if (step.kind === 'target') {
      const player = step.action === 'guard' ? selectedGuard : selectedWolf;
      const skipped =
        step.action === 'guard' ? answers.guardSkipped : answers.wolfSkipped;
      return {
        disabled: !player && !skipped,
        requirement: player
          ? `将记录 ${player.seatNumber} 号 · ${player.nickname}`
          : skipped
            ? `将记录：${step.emptyActionLabel}`
            : '还差一步：请选择一名可选玩家。',
        primaryLabel: player
          ? targetButtonLabel('确认并继续 ·', player.id)
          : skipped
            ? `确认${step.emptyActionLabel}并继续`
            : '确认并继续',
      };
    }

    if (step.kind === 'reveal') {
      return {
        disabled: !selectedSeer,
        requirement: !selectedSeer
          ? '还差一步：请选择一名查验目标。'
          : answers.seerRevealed
            ? '演示结果已显示，请完成现场手势。'
            : `将查验 ${selectedSeer.seatNumber} 号 · ${selectedSeer.nickname}`,
        primaryLabel: answers.seerRevealed
          ? '已完成手势，继续'
          : targetButtonLabel('确认查验 ·', selectedSeer?.id),
      };
    }

    if (step.kind === 'resource') {
      const poisonReady =
        answers.witchChoice !== 'poison' || Boolean(selectedPoison);
      const ready = Boolean(answers.witchChoice) && poisonReady;
      const labels: Record<WitchChoice, string> = {
        antidote: selectedWolf
          ? `使用解药 · 救起 ${selectedWolf.seatNumber} 号`
          : '使用解药',
        poison: selectedPoison
          ? `使用毒药 · ${selectedPoison.seatNumber} 号`
          : '使用毒药',
        pass: '今夜不用药',
      };
      return {
        disabled: !ready,
        requirement: !answers.witchChoice
          ? '还差一步：请选择使用或保留药剂。'
          : answers.witchChoice === 'poison' && !selectedPoison
            ? '还差一步：请选择毒药目标。'
            : `将记录：${labels[answers.witchChoice]}`,
        primaryLabel: ready
          ? `确认${labels[answers.witchChoice!]}并继续`
          : '确认并继续',
      };
    }

    if (step.kind === 'resolution') {
      return {
        disabled: false,
        requirement: '已分层展示内部记录与建议公开信息。',
        primaryLabel: '确认结算预览',
      };
    }

    return null;
  }, [
    answers,
    selectedGuard,
    selectedPoison,
    selectedSeer,
    selectedWolf,
    step,
  ]);

  if (!isValidStep(step) || totalSteps === 0) {
    return (
      <main className="night-error-page" role="alert">
        <NightIllustration tone="moon" />
        <p className="night-kicker">演示数据需要检查</p>
        <h1>这一夜的步骤没有准备好</h1>
        <p>
          当前步骤缺少必要信息。请返回模拟房间后重新进入，页面不会继续显示不完整内容。
        </p>
        <Link
          className="night-primary-button"
          to="/host"
          state={{ room: sourceRoom ?? MOCK_HOST_ROOM }}
        >
          返回模拟房间
        </Link>
      </main>
    );
  }

  const activeStep = step;

  function updateAnswer(patch: Partial<NightDemoAnswers>) {
    setAnswers((current) => ({ ...current, ...patch }));
  }

  function showSuccess(message: string) {
    window.clearTimeout(successTimer.current);
    setSuccessMessage(message);
    successTimer.current = window.setTimeout(() => setSuccessMessage(''), 720);
  }

  function goNext(message = '已记录，进入下一步') {
    showSuccess(message);
    setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
    setLiveMessage(message);
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  function handlePrimary() {
    if (activeStep.kind === 'reveal' && !answers.seerRevealed) {
      updateAnswer({ seerRevealed: true });
      showSuccess('演示查验完成');
      setLiveMessage('演示查验结果已显示，仅上帝当前步骤可见。');
      return;
    }
    goNext(activeStep.kind === 'resolution' ? '结算预览已确认' : undefined);
  }

  function handleBack() {
    setStepIndex((current) => Math.max(0, current - 1));
    setLiveMessage('已返回上一步，之前的选择仍然保留。');
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  function handleRepeat() {
    setRepeatKey((current) => current + 1);
    setLiveMessage(`主持词已重新突出：${activeStep.hostPrompt}`);
    window.setTimeout(() => promptRef.current?.focus(), 0);
  }

  function confirmSkip() {
    setSkipOpen(false);
    if (activeStep.kind === 'target' && activeStep.action === 'guard') {
      updateAnswer({ guardSkipped: true, guardTargetId: undefined });
    } else if (activeStep.kind === 'target' && activeStep.action === 'wolf') {
      updateAnswer({
        wolfSkipped: true,
        wolfTargetId: undefined,
        witchChoice: undefined,
        witchPoisonTargetId: undefined,
      });
    } else if (activeStep.kind === 'resource') {
      updateAnswer({ witchChoice: 'pass', witchPoisonTargetId: undefined });
    }
    goNext('已确认跳过，并保留返回修改入口');
  }

  function restart() {
    window.clearTimeout(successTimer.current);
    setAnswers(EMPTY_ANSWERS);
    setStepIndex(0);
    setRepeatKey(0);
    setSuccessMessage('');
    setLiveMessage('第一夜演示已经重新开始，上一轮选择已清除。');
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }

  const skippedLabel =
    activeStep.kind === 'target'
      ? activeStep.emptyActionLabel
      : activeStep.kind === 'resource'
        ? '今夜不用药'
        : '当前行动';

  return (
    <div className={`night-demo night-demo--${activeStep.tone}`}>
      <header className="night-demo__topbar">
        <Link
          to="/host"
          state={{ room: sourceRoom ?? MOCK_HOST_ROOM }}
          aria-label="退出夜间演示并返回模拟房间"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Link>
        <NightProgress currentStep={stepIndex + 1} totalSteps={totalSteps} />
      </header>

      <main key={activeStep.id} className="night-demo__stage">
        <div className="night-stage-heading">
          <NightIllustration tone={activeStep.tone} />
          <div>
            <p className="night-kicker">{activeStep.actorLabel}</p>
            <h2>{activeStep.title}</h2>
          </div>
        </div>

        <HostPrompt
          ref={promptRef}
          actorLabel={activeStep.actorLabel}
          prompt={activeStep.hostPrompt}
          repeatKey={repeatKey}
        />
        <RoleGuide guidance={activeStep.guidance} />

        <section className="night-operation" aria-label="当前操作">
          {activeStep.kind === 'info' ? (
            <InfoAction
              checked={
                activeStep.id === 'night-intro'
                  ? answers.introReady
                  : answers.nightClosed
              }
              label={activeStep.acknowledgementLabel}
              onChange={(checked) =>
                updateAnswer(
                  activeStep.id === 'night-intro'
                    ? { introReady: checked }
                    : { nightClosed: checked },
                )
              }
            />
          ) : null}

          {activeStep.kind === 'target' ? (
            <>
              <SeatTargetGrid
                action={activeStep.action}
                selectedId={
                  activeStep.action === 'guard'
                    ? answers.guardTargetId
                    : answers.wolfTargetId
                }
                label="选择一名玩家"
                onSelect={(playerId) =>
                  updateAnswer(
                    activeStep.action === 'guard'
                      ? { guardTargetId: playerId, guardSkipped: false }
                      : { wolfTargetId: playerId, wolfSkipped: false },
                  )
                }
              />
              <p className="seat-grid-legend">
                <span>
                  <i className="is-available" />
                  可选
                </span>
                <span>
                  <i className="is-selected" />
                  已选
                </span>
                <span>
                  <i className="is-disabled" />
                  禁选
                </span>
                <span>
                  <i className="is-dead" />
                  已死亡
                </span>
              </p>
            </>
          ) : null}

          {activeStep.kind === 'reveal' ? (
            answers.seerRevealed && selectedSeer ? (
              <div className="seer-result" aria-live="polite">
                <span className="seer-result__lock">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 11h14v9H5v-9Zm3 0V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  仅上帝当前步骤可见
                </span>
                <p>演示查验目标</p>
                <strong>
                  {selectedSeer.seatNumber} 号 · {selectedSeer.nickname}
                </strong>
                <div>
                  <span aria-hidden="true" />
                  演示结果 · 好人
                </div>
                <button
                  type="button"
                  onClick={() => updateAnswer({ seerRevealed: false })}
                >
                  修改查验目标
                </button>
              </div>
            ) : (
              <SeatTargetGrid
                action="seer"
                selectedId={answers.seerTargetId}
                label="选择查验目标"
                onSelect={(playerId) =>
                  updateAnswer({ seerTargetId: playerId, seerRevealed: false })
                }
              />
            )
          ) : null}

          {activeStep.kind === 'resource' ? (
            <div className="witch-operation">
              <section className="night-attack-note">
                <span aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3 4 8v5c0 5 3 8 8 9 5-1 8-4 8-9V8l-8-5Z" />
                  </svg>
                </span>
                <div>
                  <small>模拟狼刀目标</small>
                  <strong>
                    {selectedWolf
                      ? `${selectedWolf.seatNumber} 号 · ${selectedWolf.nickname}`
                      : '本夜空刀 · 无倒下玩家'}
                  </strong>
                </div>
              </section>
              <div className="potion-stock" aria-label="演示药剂剩余次数">
                <div>
                  <span className="potion-dot potion-dot--green" />
                  <p>解药</p>
                  <strong>1</strong>
                  <small>次剩余</small>
                </div>
                <div>
                  <span className="potion-dot potion-dot--purple" />
                  <p>毒药</p>
                  <strong>1</strong>
                  <small>次剩余</small>
                </div>
              </div>
              <fieldset className="potion-choices">
                <legend>选择本夜操作</legend>
                <label
                  className={`${answers.witchChoice === 'antidote' ? 'is-selected' : ''}${answers.wolfSkipped ? ' is-disabled' : ''}`}
                >
                  <input
                    type="radio"
                    name="witch-action"
                    checked={answers.witchChoice === 'antidote'}
                    disabled={answers.wolfSkipped}
                    onChange={() =>
                      updateAnswer({
                        witchChoice: 'antidote',
                        witchPoisonTargetId: undefined,
                      })
                    }
                  />
                  <span>
                    <strong>使用解药</strong>
                    <small>
                      {selectedWolf
                        ? `演示救起 ${selectedWolf.seatNumber} 号`
                        : '当前无狼刀目标'}
                    </small>
                  </span>
                </label>
                <label
                  className={
                    answers.witchChoice === 'poison' ? 'is-selected' : ''
                  }
                >
                  <input
                    type="radio"
                    name="witch-action"
                    checked={answers.witchChoice === 'poison'}
                    onChange={() => updateAnswer({ witchChoice: 'poison' })}
                  />
                  <span>
                    <strong>使用毒药</strong>
                    <small>下一步选择目标</small>
                  </span>
                </label>
                <label
                  className={
                    answers.witchChoice === 'pass' ? 'is-selected' : ''
                  }
                >
                  <input
                    type="radio"
                    name="witch-action"
                    checked={answers.witchChoice === 'pass'}
                    onChange={() =>
                      updateAnswer({
                        witchChoice: 'pass',
                        witchPoisonTargetId: undefined,
                      })
                    }
                  />
                  <span>
                    <strong>今夜不用药</strong>
                    <small>保留两份资源</small>
                  </span>
                </label>
              </fieldset>
              {answers.witchChoice === 'poison' ? (
                <div className="poison-target-stage">
                  <p>
                    <span>2</span> 选择毒药目标
                  </p>
                  <SeatTargetGrid
                    action="poison"
                    selectedId={answers.witchPoisonTargetId}
                    label="毒药目标"
                    onSelect={(playerId) =>
                      updateAnswer({ witchPoisonTargetId: playerId })
                    }
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {activeStep.kind === 'resolution' ? (
            <NightResolutionPreview answers={answers} />
          ) : null}

          {activeStep.kind === 'complete' ? (
            <div className="night-complete-actions">
              <div className="completion-sparkles" aria-hidden="true">
                <i />
                <i />
                <i />
                <i />
                <i />
              </div>
              <p>
                演示选择已经完成本轮展示。正式版本会把角色顺序、目标资格与结算结果交给状态机和规则引擎。
              </p>
              <Link
                className="night-primary-button"
                to="/host"
                state={{ room: sourceRoom ?? MOCK_HOST_ROOM }}
              >
                返回模拟房间
              </Link>
              <button
                className="night-restart-button"
                type="button"
                onClick={restart}
              >
                重新体验第一夜
              </button>
            </div>
          ) : null}
        </section>
      </main>

      {control ? (
        <NightActionFooter
          canGoBack={stepIndex > 0}
          canSkip={activeStep.allowSkip}
          primaryDisabled={control.disabled}
          primaryLabel={control.primaryLabel}
          requirement={control.requirement}
          onBack={handleBack}
          onRepeat={handleRepeat}
          onSkip={() => setSkipOpen(true)}
          onPrimary={handlePrimary}
        />
      ) : null}

      <div className="visually-hidden" aria-live="assertive">
        {liveMessage}
      </div>
      {successMessage ? (
        <div className="night-success-toast" role="status">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12 4 4 10-10" />
          </svg>
          {successMessage}
        </div>
      ) : null}
      {skipOpen ? (
        <SkipConfirmation
          actionLabel={skippedLabel}
          onCancel={() => setSkipOpen(false)}
          onConfirm={confirmSkip}
        />
      ) : null}
    </div>
  );
}
