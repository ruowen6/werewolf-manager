interface NightProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function NightProgress({ currentStep, totalSteps }: NightProgressProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div
      className="night-progress"
      aria-label={`步骤 ${currentStep}，共 ${totalSteps} 步`}
    >
      <div className="night-progress__labels">
        <span>第一夜 · 演示模式</span>
        <strong>
          {currentStep} / {totalSteps}
        </strong>
      </div>
      <div className="night-progress__track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
      <p>演示步骤，不代表最终规则顺序</p>
    </div>
  );
}
