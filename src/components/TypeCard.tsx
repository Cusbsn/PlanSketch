import type { OutputType } from '../types';

interface TypeCardProps {
  type: OutputType;
  description: string;
  selected: boolean;
  onClick: (type: OutputType) => void;
}

export function TypeCard({ type, description, selected, onClick }: TypeCardProps) {
  return (
    <button
      type="button"
      className={selected ? 'type-card selected' : 'type-card'}
      onClick={() => onClick(type)}
    >
      <span className="type-card-badge">{type}</span>
      <p>{description}</p>
    </button>
  );
}
