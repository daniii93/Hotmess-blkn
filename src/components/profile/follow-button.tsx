type FollowButtonProps = {
  state: "none" | "requested" | "following" | "friends";
};

const labels: Record<FollowButtonProps["state"], string> = {
  none: "Folgen",
  requested: "Angefragt",
  following: "Folge ich",
  friends: "Freunde",
};

export function FollowButton({ state }: FollowButtonProps) {
  return (
    <button className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-hm-porcelain hover:bg-hm-gold">
      {labels[state]}
    </button>
  );
}
