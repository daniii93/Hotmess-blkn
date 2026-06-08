import type { FormEvent } from "react";

const REACTIONS = ["❤️", "😂", "😮", "😢", "😡", "👍"] as const;

type ReactionBarProps = {
  onReact: (emoji: string) => void;
  onMore: () => void;
};

export function ReactionBar({ onReact, onMore }: ReactionBarProps) {
  const handleReact = (emoji: string) => (event: FormEvent<HTMLButtonElement>) => {
    event.preventDefault();
    onReact(emoji);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/90 p-2 shadow-2xl backdrop-blur-xl">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full text-lg transition hover:scale-110 hover:bg-zinc-100"
          onClick={handleReact(emoji)}
          aria-label={`Mit ${emoji} reagieren`}
        >
          {emoji}
        </button>
      ))}
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-lg transition hover:scale-110 hover:bg-zinc-100"
        onClick={onMore}
        aria-label="Weitere Reaktionen"
      >
        +
      </button>
    </div>
  );
}
