export type MessageContextAction = "pin" | "unpin" | "mute" | "unmute" | "delete";

type MessageContextMenuProps = {
  x: number;
  y: number;
  pinned: boolean;
  muted: boolean;
  onAction: (action: MessageContextAction) => void;
};

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M14.5 4.5 19 9l-2 2 1.5 1.5-2.1 2.1-3-3-4.8 4.8-.7 4.2-1.5-1.5.7-4.2 4.8-4.8-3-3L11 5.5 12.5 7l2-2Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function MutedBellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M15 17H8l1.4-1.8V11a5 5 0 0 1 8.2-3.8M18.5 11.5v3.2L20 17h-2.8M10 19a2 2 0 0 0 4 0M4 4l16 16" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 16h10l1-16M9 7l1-3h4l1 3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export function MessageContextMenu({ x, y, pinned, muted, onAction }: MessageContextMenuProps) {
  return (
    <div
      className="fixed z-50 w-[min(310px,calc(100vw-28px))] origin-top animate-[messageMenuIn_170ms_cubic-bezier(.2,.9,.2,1.1)]"
      style={{ left: x, top: y }}
      role="menu"
    >
      <div className="grid overflow-hidden rounded-[26px] border border-[#e5c38c]/25 bg-[#0d0b09]/85 p-2 shadow-2xl backdrop-blur-2xl">
        <button className="grid min-h-[58px] grid-cols-[42px_1fr] items-center gap-3 rounded-[18px] px-4 text-left text-white hover:bg-white/10" type="button" onClick={() => onAction(pinned ? "unpin" : "pin")}>
          <PinIcon />
          <span className="font-semibold">{pinned ? "Fixierung lösen" : "Fixieren"}</span>
        </button>
        <button className="grid min-h-[58px] grid-cols-[42px_1fr] items-center gap-3 rounded-[18px] px-4 text-left text-white hover:bg-white/10" type="button" onClick={() => onAction(muted ? "unmute" : "mute")}>
          <MutedBellIcon />
          <span className="font-semibold">{muted ? "Stummschaltung aufheben" : "Stummschalten"}</span>
        </button>
        <button className="grid min-h-[58px] grid-cols-[42px_1fr] items-center gap-3 rounded-[18px] px-4 text-left font-semibold text-red-500 hover:bg-red-500/10" type="button" onClick={() => onAction("delete")}>
          <TrashIcon />
          <span>Löschen</span>
        </button>
      </div>
    </div>
  );
}
