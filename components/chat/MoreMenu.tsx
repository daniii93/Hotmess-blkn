type MoreMenuProps = {
  onCopy: () => void;
  onTranslate: () => void;
  onPin: () => void;
};

export function MoreMenu({ onCopy, onTranslate, onPin }: MoreMenuProps) {
  return (
    <div className="grid border-t border-black/5 bg-zinc-50/95 p-2">
      <button className="min-h-11 rounded-xl px-3 text-left text-sm hover:bg-white" type="button" onClick={onCopy}>
        Kopieren
      </button>
      <button className="min-h-11 rounded-xl px-3 text-left text-sm hover:bg-white" type="button" onClick={onTranslate}>
        Übersetzen
      </button>
      <button className="min-h-11 rounded-xl px-3 text-left text-sm hover:bg-white" type="button" onClick={onPin}>
        Fixieren
      </button>
    </div>
  );
}
