import { getCharacterLimit } from "../utils/validation";

interface CharacterCounterProps {
  platform: string;
  count: number;
}

function CharacterCounter({ platform, count }: CharacterCounterProps) {
  const limit = getCharacterLimit(platform) || 280;
  const remaining = limit - count;
  const isOver = remaining < 0;
  const isWarning = remaining <= 20 && !isOver;

  return (
    <div className="counter" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          color: isOver ? "#f87171" : isWarning ? "#fbbf24" : "var(--text-muted)",
          fontWeight: isOver || isWarning ? 700 : 500,
          fontSize: "0.85rem",
        }}
      >
        {count} / {limit} characters
      </span>
    </div>
  );
}

export default CharacterCounter;