interface StepPillProps {
  label: string;
  index: number;
  active: boolean;
}

export function StepPill({ label, index, active }: StepPillProps) {
  return (
    <div className={active ? 'step-pill active' : 'step-pill'}>
      <span>{`0${index}`}</span>
      <strong>{label}</strong>
    </div>
  );
}
