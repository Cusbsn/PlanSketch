interface ResultCardProps {
  label: string;
  imageUrl: string;
  notes: string;
}

export function ResultCard({ label, imageUrl, notes }: ResultCardProps) {
  return (
    <article className="result-card">
      <img src={imageUrl} alt={label} />
      <div className="result-card-copy">
        <div>
          <span className="result-card-tag">Mock Output</span>
          <h3>{label}</h3>
        </div>
        <p>{notes}</p>
      </div>
    </article>
  );
}
