interface Props {
  value: number;
  used: boolean;
  onPick: () => void;
}

export default function Tile({ value, used, onPick }: Props) {
  return (
    <button
      className={`tile${used ? ' tile--used' : ''}`}
      disabled={used}
      onClick={onPick}
      aria-label={used ? `$${value}, used` : `$${value}`}
    >
      ${value}
    </button>
  );
}
