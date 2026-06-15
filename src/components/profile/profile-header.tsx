import Image from "next/image";

type ProfileHeaderProps = {
  name: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
};

export function ProfileHeader({ name, username, bio, avatarUrl, coverImageUrl }: ProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-luxury">
      <div className="h-44 bg-hm-champagne">
        {coverImageUrl ? <Image src={coverImageUrl} alt="" width={1200} height={320} className="h-full w-full object-cover" /> : null}
      </div>
      <div className="px-6 pb-6">
        <div className="-mt-12 h-24 w-24 overflow-hidden rounded-full border-4 border-hm-porcelain bg-hm-ivory">
          {avatarUrl ? <Image src={avatarUrl} alt={name} width={96} height={96} className="h-full w-full object-cover" /> : null}
        </div>
        <h1 className="hm-display mt-4 text-4xl">{name}</h1>
        <p className="text-hm-inkSoft">@{username}</p>
        {bio ? <p className="mt-4 max-w-2xl text-sm leading-7 text-hm-inkSoft">{bio}</p> : null}
      </div>
    </section>
  );
}
