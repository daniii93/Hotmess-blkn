"use client";

import React, { useMemo, useState } from "react";
import {
  Bookmark,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  Film,
  Grid3X3,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Music2,
  Plus,
  PlusSquare,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Ticket,
  Trash2,
  User,
  X,
} from "lucide-react";

const RED = "#FF3040";
const INK = "#0A0A0A";
const LINE = "#EDEDED";

const stories = [
  { id: "me", username: "Deine Story", label: "Du", gradient: "from-zinc-100 to-white" },
  { id: "hotmess", username: "hotmess", label: "HM", gradient: "from-black via-red-900 to-orange-500" },
  { id: "innferno_mma", username: "innferno_mma", label: "IM", gradient: "from-zinc-950 via-zinc-700 to-yellow-500" },
  { id: "lena.fit", username: "lena.fit", label: "LF", gradient: "from-pink-500 to-purple-700" },
  { id: "fightcrew", username: "fightcrew", label: "FC", gradient: "from-sky-500 to-indigo-800" },
  { id: "vienna.moves", username: "vienna.moves", label: "VM", gradient: "from-emerald-500 to-zinc-950" },
];

const posts = [
  {
    id: "fight-night",
    username: "hotmess",
    verified: true,
    avatar: "HM",
    gradient: "from-black via-red-950 to-orange-500",
    label: "FIGHT NIGHT",
    likes: 1847,
    caption: "HotMess Fight Night Vol. 7. Tickets sind jetzt offen.",
  },
  {
    id: "training",
    username: "innferno_mma",
    verified: false,
    avatar: "IM",
    gradient: "from-zinc-950 via-slate-800 to-yellow-500",
    label: "TRAINING",
    likes: 923,
    caption: "Letzte Runde vor dem Event. Wer ist dabei?",
  },
  {
    id: "bootcamp",
    username: "hotmess",
    verified: true,
    avatar: "HM",
    gradient: "from-zinc-950 via-emerald-900 to-lime-500",
    label: "BOOTCAMP",
    likes: 1212,
    caption: "Ein Wochenende. Eine Crew. Null Ausreden.",
  },
];

const reels = [
  { id: "r1", username: "hotmess", label: "FIGHT NIGHT", likes: 8842, caption: "Wenn die Lichter ausgehen, beginnt HotMess.", gradient: "from-black via-red-950 to-orange-500" },
  { id: "r2", username: "innferno_mma", label: "TRAINING CAMP", likes: 2310, caption: "Noch 12 Tage bis Innsbruck.", gradient: "from-zinc-950 via-slate-800 to-yellow-500" },
  { id: "r3", username: "hotmess", label: "AFTERMOVIE", likes: 7430, caption: "Die besten Momente vom letzten Event.", gradient: "from-black via-purple-950 to-pink-600" },
];

const exploreTiles = [
  "Fight Night",
  "HYROX",
  "Boxing",
  "Bootcamp",
  "Aftermovie",
  "Crew",
  "Vienna",
  "Innsbruck",
  "Training",
  "Tickets",
  "Backstage",
  "Gala",
];

const events = [
  {
    id: "vol7",
    title: "HotMess Fight Night Vol. 7",
    date: "Sa., 27. Juli 2026",
    place: "Innsbruck, Hafen",
    category: "Fight Night",
    price: 3900,
    gradient: "from-zinc-950 via-red-950 to-orange-500",
  },
  {
    id: "hyrox",
    title: "HYROX × HotMess Challenge",
    date: "Fr., 09. August 2026",
    place: "Wien, Marx Halle",
    category: "Challenge",
    price: 4900,
    gradient: "from-zinc-950 via-slate-700 to-yellow-500",
  },
  {
    id: "boxing",
    title: "Boxing Gala — Title Night",
    date: "Sa., 24. August 2026",
    place: "Graz, Orpheum",
    category: "Gala",
    price: 5900,
    gradient: "from-black via-stone-800 to-red-600",
  },
  {
    id: "bootcamp-festival",
    title: "HotMess Bootcamp Festival",
    date: "So., 08. September 2026",
    place: "Klagenfurt, Wörthersee",
    category: "Festival",
    price: 2900,
    gradient: "from-zinc-950 via-emerald-900 to-lime-500",
  },
];

const tabs = [
  { key: "home", label: "Start", Icon: Home },
  { key: "reels", label: "Reels", Icon: Film },
  { key: "create", label: "Erstellen", Icon: PlusSquare },
  { key: "search", label: "Suchen", Icon: Search },
  { key: "profile", label: "Profil", Icon: User },
];

function money(cents) {
  return new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function HotMess({ color = INK, size = 34 }) {
  return (
    <span className="inline-flex flex-col items-start leading-none" style={{ color }}>
      <span
        className="font-black italic tracking-[-0.03em]"
        style={{
          fontFamily: "'Snell Roundhand','Brush Script MT','Segoe Script',cursive",
          fontSize: size,
        }}
      >
        HotMess
      </span>
      <svg aria-hidden="true" className="-mt-1" fill="none" height="8" viewBox="0 0 112 12" width={Math.max(92, size * 3.1)}>
        <path d="M3 8C28 1 72 1 109 7" stroke={color} strokeLinecap="round" strokeWidth="2.4" />
      </svg>
    </span>
  );
}

function IconButton({ label, children, onClick, badge }) {
  return (
    <button
      aria-label={label}
      className="relative grid h-10 w-10 place-items-center rounded-full text-[#0A0A0A] outline-none transition active:scale-95 hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-[#FF3040]"
      type="button"
      onClick={onClick}
    >
      {children}
      {badge ? (
        <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#FF3040] px-1 text-[10px] font-bold text-white ring-2 ring-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-zinc-100 px-3 py-6">
      <div className="mx-auto h-[780px] max-h-[calc(100vh-48px)] w-full max-w-[390px] overflow-hidden rounded-[42px] border-[10px] border-black bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-8 items-center justify-between bg-white px-6 text-xs font-semibold text-[#0A0A0A]">
      <span>18:26</span>
      <span className="flex items-center gap-2">
        <span>5G</span>
        <span className="h-3 w-6 rounded-sm border border-black p-[1px]">
          <span className="block h-full w-4 rounded-[1px] bg-black" />
        </span>
      </span>
    </div>
  );
}

function AppHeader({ onHome, onCreate, onActivity, onShop, cartCount }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#EDEDED] bg-white px-4">
      <button aria-label="Zurück zur Startseite" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" onClick={onHome}>
        <HotMess />
      </button>
      <div className="flex items-center gap-1">
        <IconButton label="Erstellen" onClick={onCreate}>
          <PlusSquare strokeWidth={2.2} />
        </IconButton>
        <IconButton label="Aktivität" onClick={onActivity}>
          <Heart strokeWidth={2.2} />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#FF3040] ring-2 ring-white" />
        </IconButton>
        <IconButton label="Tickets und Warenkorb" onClick={onShop} badge={cartCount || null}>
          <ShoppingBag strokeWidth={2.2} />
        </IconButton>
      </div>
    </header>
  );
}

function StoryRing({ story, first }) {
  return (
    <button className="w-20 shrink-0 rounded-xl outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" aria-label={story.username}>
      <span className="relative mx-auto grid h-[68px] w-[68px] place-items-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] p-[3px]">
        <span className={`grid h-full w-full place-items-center rounded-full border-2 border-white bg-gradient-to-br ${story.gradient} text-sm font-black ${story.id === "me" ? "text-black" : "text-white"}`}>
          {story.label}
        </span>
        {first ? <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-sky-500 text-white ring-2 ring-white">+</span> : null}
      </span>
      <span className="mt-1 block truncate text-xs text-[#0A0A0A]">{story.username}</span>
    </button>
  );
}

function Stories() {
  return (
    <section className="border-b border-[#EDEDED] py-3">
      <div className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none]">
        {stories.map((story, index) => (
          <StoryRing first={index === 0} key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}

function VerifiedBadge() {
  return <span className="grid h-4 w-4 place-items-center rounded-full bg-sky-500 text-[10px] font-black text-white">✓</span>;
}

function PostCard({ post, liked, onToggleLike }) {
  const likeCount = post.likes + (liked ? 1 : 0);

  return (
    <article className="border-b border-[#EDEDED] bg-white">
      <header className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] p-[2px]">
            <span className="grid h-full w-full place-items-center rounded-full border-2 border-white bg-black text-[11px] font-black text-white">{post.avatar}</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-bold">
            {post.username}
            {post.verified ? <VerifiedBadge /> : null}
          </span>
        </div>
        <IconButton label="Mehr">
          <MoreHorizontal />
        </IconButton>
      </header>
      <div className={`grid aspect-square place-items-center bg-gradient-to-br ${post.gradient} text-white`}>
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/70">HotMess</p>
          <p className="mt-2 text-4xl font-black tracking-tight">{post.label}</p>
        </div>
      </div>
      <div className="px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button aria-label={liked ? "Like entfernen" : "Beitrag liken"} className="rounded outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" onClick={onToggleLike}>
              <Heart className={liked ? "fill-[#FF3040] text-[#FF3040]" : "text-[#0A0A0A]"} strokeWidth={liked ? 2.8 : 2.1} />
            </button>
            <button aria-label="Kommentieren" className="rounded outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button">
              <MessageCircle />
            </button>
            <button aria-label="Senden" className="rounded outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button">
              <Send />
            </button>
          </div>
          <button aria-label="Speichern" className="rounded outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button">
            <Bookmark />
          </button>
        </div>
        <p className="mt-3 text-sm font-bold">{likeCount.toLocaleString("de-AT")} Gefällt mir</p>
        <p className="mt-1 text-sm">
          <span className="font-bold">{post.username}</span> {post.caption}
        </p>
      </div>
    </article>
  );
}

function FeedView({ liked, onToggleLike }) {
  return (
    <>
      <Stories />
      <section>
        {posts.map((post) => (
          <PostCard liked={Boolean(liked[`post:${post.id}`])} key={post.id} post={post} onToggleLike={() => onToggleLike(`post:${post.id}`)} />
        ))}
      </section>
    </>
  );
}

function ReelsView({ liked, onToggleLike }) {
  return (
    <section className="h-full snap-y snap-mandatory overflow-y-auto bg-black [scrollbar-width:none]">
      {reels.map((reel) => {
        const isLiked = Boolean(liked[`reel:${reel.id}`]);
        const likeCount = reel.likes + (isLiked ? 1 : 0);
        return (
          <article className={`relative flex h-full snap-start flex-col justify-between bg-gradient-to-br ${reel.gradient} p-4 text-white`} key={reel.id}>
            <div className="flex items-center justify-between pt-2">
              <span className="inline-flex items-center gap-2 text-lg font-black">
                <Camera className="h-5 w-5" /> Reels
              </span>
              <button aria-label="Zurück zur Startseite" className="rounded-full bg-white/10 p-2 outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-white" type="button">
                <MoreHorizontal />
              </button>
            </div>
            <div className="grid place-items-center text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.35em] text-white/70">HotMess</p>
              <p className="mt-3 text-5xl font-black tracking-tight">{reel.label}</p>
            </div>
            <div className="flex items-end justify-between">
              <div className="min-w-0 pb-2">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-black text-[11px] font-black">HM</span>
                  <span className="text-sm font-black">@{reel.username}</span>
                  <button className="rounded-full border border-white px-3 py-1 text-xs font-black active:scale-95" type="button">
                    Folgen
                  </button>
                </div>
                <p className="mt-3 text-sm font-semibold">{reel.caption}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-white/80">
                  <Music2 className="h-4 w-4" /> Originalton - HotMess
                </p>
              </div>
              <div className="grid gap-5 text-center">
                <button aria-label="Reel liken" className="grid place-items-center outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-white" type="button" onClick={() => onToggleLike(`reel:${reel.id}`)}>
                  <Heart className={isLiked ? "fill-[#FF3040] text-[#FF3040]" : "text-white"} />
                  <span className="mt-1 text-xs font-bold">{likeCount.toLocaleString("de-AT")}</span>
                </button>
                <button aria-label="Kommentieren" className="grid place-items-center outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-white" type="button">
                  <MessageCircle />
                  <span className="mt-1 text-xs font-bold">84</span>
                </button>
                <button aria-label="Senden" className="grid place-items-center outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-white" type="button">
                  <Send />
                </button>
                <button aria-label="Mehr" className="grid place-items-center outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-white" type="button">
                  <MoreHorizontal />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function CreateView({ goHome, showNotice }) {
  const [selected, setSelected] = useState(0);
  const gradients = ["from-black via-red-950 to-orange-500", "from-zinc-950 via-slate-800 to-yellow-500", "from-black via-purple-950 to-pink-600", "from-zinc-950 via-emerald-900 to-lime-500", "from-stone-900 via-stone-600 to-amber-400", "from-black via-blue-950 to-cyan-500"];

  const share = () => {
    goHome();
    showNotice("Beitrag geteilt ✓");
  };

  return (
    <section className="min-h-full bg-white">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#EDEDED] bg-white px-3">
        <IconButton label="Abbrechen" onClick={goHome}>
          <X />
        </IconButton>
        <h2 className="text-base font-black">Neuer Beitrag</h2>
        <button className="rounded-full px-3 py-2 text-sm font-black text-sky-600 outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500" type="button" onClick={share}>
          Teilen
        </button>
      </header>
      <div className="p-4">
        <div className={`grid aspect-square place-items-center rounded-3xl bg-gradient-to-br ${gradients[selected]} text-white`}>
          <p className="text-4xl font-black">HotMess</p>
        </div>
        <textarea
          className="mt-4 min-h-24 w-full resize-none rounded-2xl border border-[#EDEDED] px-4 py-3 text-sm outline-none focus:border-sky-500"
          placeholder="Bildunterschrift schreiben ..."
          onChange={() => undefined}
        />
        <p className="mt-4 text-sm font-black">Aus Galerie wählen</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {gradients.map((gradient, index) => (
            <button
              aria-label={`Bild ${index + 1} auswählen`}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${gradient} outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-sky-500 ${selected === index ? "ring-4 ring-sky-500" : ""}`}
              key={gradient}
              type="button"
              onClick={() => setSelected(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SearchView() {
  return (
    <section className="min-h-full bg-white">
      <div className="sticky top-0 z-10 border-b border-[#EDEDED] bg-white p-3">
        <label className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-3 text-sm text-zinc-500">
          <Search className="h-4 w-4" />
          <input className="w-full bg-transparent text-[#0A0A0A] outline-none" placeholder="Suchen" onChange={() => undefined} />
        </label>
      </div>
      <div className="grid grid-cols-3 gap-1 p-1">
        {exploreTiles.map((tile, index) => (
          <button
            aria-label={`${tile} öffnen`}
            className={`grid aspect-square place-items-center bg-gradient-to-br ${
              index % 4 === 0 ? "from-black to-red-700" : index % 4 === 1 ? "from-zinc-900 to-yellow-500" : index % 4 === 2 ? "from-black to-purple-700" : "from-zinc-900 to-emerald-600"
            } p-2 text-center text-xs font-black uppercase text-white outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]`}
            key={tile}
            type="button"
          >
            {tile}
          </button>
        ))}
      </div>
    </section>
  );
}

function ProfileView({ openShop }) {
  return (
    <section className="min-h-full bg-white">
      <header className="flex h-14 items-center justify-between border-b border-[#EDEDED] px-4">
        <h2 className="text-lg font-black">hotmess</h2>
        <IconButton label="Einstellungen">
          <Settings />
        </IconButton>
      </header>
      <div className="p-4">
        <div className="flex items-center gap-5">
          <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] p-[3px]">
            <span className="grid h-full w-full place-items-center rounded-full border-4 border-white bg-black text-xl font-black text-white">HM</span>
          </span>
          <div className="grid flex-1 grid-cols-3 text-center">
            <Stat value="18" label="Beiträge" />
            <Stat value="3.343" label="Follower" />
            <Stat value="1.889" label="Gefolgt" />
          </div>
        </div>
        <div className="mt-4 text-sm">
          <p className="font-black">HotMess</p>
          <p>Fight nights, Training, Events und Crew-Momente.</p>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-black active:scale-95" type="button">
            Profil bearbeiten
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-black text-white active:scale-95" type="button" onClick={openShop}>
            <Ticket className="h-4 w-4" /> Meine Tickets
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 border-y border-[#EDEDED]">
        {[Grid3X3, Film, User].map((Icon, index) => (
          <button aria-label={`Profil Tab ${index + 1}`} className="grid h-12 place-items-center outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" key={index} type="button">
            <Icon className={index === 0 ? "text-black" : "text-zinc-400"} />
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 p-1">
        {posts.concat(posts).map((post, index) => (
          <div className={`grid aspect-square place-items-center bg-gradient-to-br ${post.gradient} text-[10px] font-black text-white`} key={`${post.id}-${index}`}>
            {post.label}
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-base font-black">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

function ShopHeader({ cartCount, onBack, onCart }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#EDEDED] bg-white px-3">
      <IconButton label="Zurück zur Startseite" onClick={onBack}>
        <ChevronLeft />
      </IconButton>
      <h2 className="text-base font-black">Tickets</h2>
      <IconButton label="Warenkorb öffnen" onClick={onCart} badge={cartCount || null}>
        <ShoppingBag />
      </IconButton>
    </header>
  );
}

function EventCard({ event, quantity, onAdd }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-[#EDEDED] bg-white shadow-sm">
      <div className={`relative grid h-40 place-items-center bg-gradient-to-br ${event.gradient} text-white`}>
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-black">{event.category}</span>
        <span className="absolute bottom-3 right-3 opacity-80">
          <HotMess color="#FFFFFF" size={26} />
        </span>
        <p className="text-2xl font-black uppercase tracking-tight">Tickets</p>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-black leading-tight">{event.title}</h3>
        <p className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
          <Calendar className="h-4 w-4" /> {event.date}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-zinc-600">
          <MapPin className="h-4 w-4" /> {event.place}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-black">{money(event.price)}</span>
          <button className="rounded-full bg-black px-4 py-2 text-sm font-black text-white outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" onClick={() => onAdd(event.id)}>
            {quantity > 0 ? `Im Korb (${quantity})` : "In den Korb"}
          </button>
        </div>
      </div>
    </article>
  );
}

function TicketShop({ cart, cartCount, onAdd, onCart, onBack }) {
  return (
    <>
      <ShopHeader cartCount={cartCount} onBack={onBack} onCart={onCart} />
      <section className="space-y-4 p-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">Ticketverkauf</p>
          <h1 className="mt-1 flex items-end gap-2 text-2xl font-black">
            <HotMess size={30} /> EVENTS
          </h1>
        </div>
        {events.map((event) => (
          <EventCard event={event} key={event.id} quantity={cart[event.id] || 0} onAdd={onAdd} />
        ))}
      </section>
    </>
  );
}

function CartView({ cart, onBack, onAdd, onRemove, onCheckout, goHome }) {
  const lines = events.filter((event) => cart[event.id]);
  const total = lines.reduce((sum, event) => sum + event.price * cart[event.id], 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-[#EDEDED] bg-white px-3">
        <div className="absolute left-3">
          <IconButton label="Zurück zu Tickets" onClick={onBack}>
            <ChevronLeft />
          </IconButton>
        </div>
        <h2 className="text-base font-black">Warenkorb</h2>
        <div className="absolute right-3">
          <IconButton label="Zurück zur Startseite" onClick={goHome}>
            <Home />
          </IconButton>
        </div>
      </header>
      {lines.length === 0 ? (
        <section className="grid min-h-full place-items-center px-8 text-center">
          <div>
            <ShoppingBag className="mx-auto h-12 w-12" />
            <h2 className="mt-4 text-2xl font-black">Dein Korb ist leer</h2>
            <p className="mt-2 text-sm text-zinc-500">Such dir ein Event aus und sichere dir dein Ticket.</p>
            <button className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-black text-white active:scale-95" type="button" onClick={onBack}>
              Tickets ansehen
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="space-y-3 p-4 pb-28">
            {lines.map((event) => {
              const quantity = cart[event.id];
              return (
                <article className="rounded-3xl border border-[#EDEDED] bg-white p-4 shadow-sm" key={event.id}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-black leading-tight">{event.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{event.date}</p>
                      <p className="mt-2 text-sm font-bold">{money(event.price)} pro Ticket</p>
                    </div>
                    <p className="font-black">{money(event.price * quantity)}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      aria-label={quantity === 1 ? "Entfernen" : "Menge verringern"}
                      className="grid h-9 w-9 place-items-center rounded-full border border-[#EDEDED] outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]"
                      type="button"
                      onClick={() => onRemove(event.id)}
                    >
                      {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </button>
                    <span className="min-w-6 text-center font-black">{quantity}</span>
                    <button aria-label="Menge erhöhen" className="grid h-9 w-9 place-items-center rounded-full bg-black text-white outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" onClick={() => onAdd(event.id)}>
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
          <footer className="absolute bottom-0 left-0 right-0 border-t border-[#EDEDED] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Gesamtsumme</span>
              <span className="text-xl font-black">{money(total)}</span>
            </div>
            <button className="mt-3 w-full rounded-full bg-black py-3 text-sm font-black text-white outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" onClick={onCheckout}>
              Zur Kasse
            </button>
          </footer>
        </>
      )}
    </>
  );
}

function CheckoutView({ order, goHome, openShop }) {
  return (
    <section className="grid min-h-full place-items-center bg-white px-6 text-center">
      <div>
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-600 text-white">
          <Check className="h-10 w-10" />
        </span>
        <h1 className="mt-5 text-3xl font-black">Bestellung bestätigt</h1>
        <p className="mt-3 text-sm text-zinc-500">Deine Tickets wurden per E-Mail gesendet.</p>
        <div className="mt-6 rounded-3xl border border-[#EDEDED] p-4 text-left">
          <p className="flex justify-between text-sm">
            <span>Tickets</span>
            <strong>{order?.count ?? 0}</strong>
          </p>
          <p className="mt-2 flex justify-between text-sm">
            <span>Gesamtsumme</span>
            <strong>{money(order?.total ?? 0)}</strong>
          </p>
        </div>
        <button className="mt-6 w-full rounded-full bg-black py-3 text-sm font-black text-white active:scale-95" type="button" onClick={goHome}>
          Zurück zur Startseite
        </button>
        <button className="mt-3 w-full rounded-full border border-[#EDEDED] py-3 text-sm font-black active:scale-95" type="button" onClick={openShop}>
          Weitere Tickets ansehen
        </button>
      </div>
    </section>
  );
}

function ActivityView({ goHome, openShop, goTab }) {
  const items = [
    { id: "like", title: "anna gefällt dein Beitrag", text: "Fight Night hat gerade neue Reaktionen.", action: "Feed ansehen", onClick: goHome },
    { id: "reel", title: "Neue Reels verfügbar", text: "Drei neue Clips aus Training und Aftermovie.", action: "Reels öffnen", onClick: () => goTab("reels") },
    { id: "ticket", title: "Tickets im Fokus", text: "HotMess Fight Night Vol. 7 ist bereit für den Verkauf.", action: "Tickets ansehen", onClick: openShop },
  ];

  return (
    <section className="min-h-full bg-white">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-[#EDEDED] bg-white px-3">
        <div className="absolute left-3">
          <IconButton label="Zurück zur Startseite" onClick={goHome}>
            <ChevronLeft />
          </IconButton>
        </div>
        <h2 className="text-base font-black">Aktivität</h2>
        <div className="absolute right-3">
          <IconButton label="Startseite" onClick={goHome}>
            <Home />
          </IconButton>
        </div>
      </header>
      <div className="space-y-4 p-4">
        <div className="rounded-3xl bg-black p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#FF3040]">
              <Heart className="fill-white text-white" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/60">HotMess Funktion</p>
              <h1 className="mt-1 text-2xl font-black">Funktionskreis</h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/75">
            Hier liegt die neue Single-File-Demo als Aktivitäts-Funktion: Feed, Reels, Erstellen, Suche, Profil und Ticketverkauf bleiben verbunden.
          </p>
        </div>
        {items.map((item) => (
          <article className="rounded-3xl border border-[#EDEDED] bg-white p-4 shadow-sm" key={item.id}>
            <h3 className="text-sm font-black">{item.title}</h3>
            <p className="mt-1 text-sm text-zinc-500">{item.text}</p>
            <button
              className="mt-4 rounded-full bg-black px-4 py-2 text-sm font-black text-white outline-none active:scale-95 focus-visible:ring-2 focus-visible:ring-[#FF3040]"
              type="button"
              onClick={item.onClick}
            >
              {item.action}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function BottomNav({ screen, tab, onTab }) {
  const activeTab = screen === "feed" ? tab : "";
  return (
    <nav className="flex h-[74px] shrink-0 items-center justify-around border-t border-[#EDEDED] bg-white px-1">
      {tabs.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <button
            aria-label={label}
            className="grid h-12 w-16 place-items-center rounded-xl outline-none transition active:scale-95 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-[#FF3040]"
            key={key}
            type="button"
            onClick={() => onTab(key)}
          >
            <Icon className={active ? "fill-[#0A0A0A] text-[#0A0A0A]" : "text-[#0A0A0A]"} strokeWidth={active ? 3 : 2} />
          </button>
        );
      })}
    </nav>
  );
}

export default function HotMessInstagramPrototype() {
  const [screen, setScreen] = useState("feed");
  const [tab, setTab] = useState("home");
  const [cart, setCart] = useState({});
  const [liked, setLiked] = useState({});
  const [order, setOrder] = useState(null);
  const [notice, setNotice] = useState("");

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, value) => sum + value, 0), [cart]);
  const cartTotal = useMemo(() => events.reduce((sum, event) => sum + event.price * (cart[event.id] || 0), 0), [cart]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  const goHome = () => {
    setScreen("feed");
    setTab("home");
  };

  const goTab = (nextTab) => {
    setScreen("feed");
    setTab(nextTab);
  };

  const openShop = () => {
    setScreen("shop");
  };

  const openCart = () => {
    setScreen("cart");
  };

  const openActivity = () => {
    setScreen("activity");
  };

  const addToCart = (eventId) => {
    setCart((current) => ({ ...current, [eventId]: (current[eventId] || 0) + 1 }));
    showNotice("Hinzugefügt");
  };

  const changeQty = (eventId, delta) => {
    setCart((current) => {
      const nextQuantity = (current[eventId] || 0) + delta;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[eventId];
      else next[eventId] = nextQuantity;
      return next;
    });
  };

  const checkout = () => {
    if (!cartCount) {
      showNotice("Dein Korb ist leer");
      return;
    }
    setOrder({ count: cartCount, total: cartTotal });
    setCart({});
    setScreen("checkout");
    showNotice("Bestellung bestätigt ✓");
  };

  const toggleLike = (id) => setLiked((current) => ({ ...current, [id]: !current[id] }));

  const content = (() => {
    if (screen === "shop") return <TicketShop cart={cart} cartCount={cartCount} onAdd={addToCart} onBack={goHome} onCart={openCart} />;
    if (screen === "cart") return <CartView cart={cart} goHome={goHome} onAdd={(id) => changeQty(id, 1)} onBack={openShop} onCheckout={checkout} onRemove={(id) => changeQty(id, -1)} />;
    if (screen === "checkout") return <CheckoutView goHome={goHome} openShop={openShop} order={order} />;
    if (screen === "activity") return <ActivityView goHome={goHome} goTab={goTab} openShop={openShop} />;
    if (tab === "home") return <FeedView liked={liked} onToggleLike={toggleLike} />;
    if (tab === "reels") return <ReelsView liked={liked} onToggleLike={toggleLike} />;
    if (tab === "create") return <CreateView goHome={goHome} showNotice={showNotice} />;
    if (tab === "search") return <SearchView />;
    return <ProfileView openShop={openShop} />;
  })();

  const showMainHeader = screen === "feed" && tab !== "create";

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col bg-white text-[#0A0A0A]">
        <StatusBar />
        {showMainHeader ? <AppHeader cartCount={cartCount} onActivity={openActivity} onCreate={() => goTab("create")} onHome={goHome} onShop={openShop} /> : null}
        <main className="relative min-h-0 flex-1 overflow-y-auto">
          {content}
          {notice ? <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-black px-4 py-2 text-sm font-black text-white shadow-lg">{notice}</div> : null}
        </main>
        <BottomNav screen={screen} tab={tab} onTab={goTab} />
      </div>
    </PhoneFrame>
  );
}
