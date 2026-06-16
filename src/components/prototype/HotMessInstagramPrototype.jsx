"use client";

import React, { useMemo, useState } from "react";
import {
  Bookmark,
  Calendar,
  ChevronLeft,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Minus,
  MoreHorizontal,
  PlaySquare,
  Plus,
  PlusSquare,
  Search,
  Send,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";

const storyUsers = [
  { id: "me", username: "Deine Story", label: "Du", color: "from-zinc-200 to-zinc-50" },
  { id: "hotmess", username: "hotmess", label: "HM", color: "from-red-500 to-black" },
  { id: "innferno_mma", username: "innferno_mma", label: "IM", color: "from-orange-500 to-stone-950" },
  { id: "nina.moves", username: "nina.moves", label: "NM", color: "from-pink-400 to-purple-700" },
  { id: "fightcrew", username: "fightcrew", label: "FC", color: "from-sky-500 to-indigo-800" },
];

const posts = [
  {
    id: "fight-night",
    username: "hotmess",
    verified: true,
    avatar: "HM",
    gradient: "from-[#18181b] via-[#991b1b] to-[#f97316]",
    label: "FIGHT NIGHT",
    likes: 1847,
    caption: "HotMess Fight Night Vol. 7. Tickets sind jetzt offen.",
  },
  {
    id: "training",
    username: "innferno_mma",
    verified: false,
    avatar: "IM",
    gradient: "from-[#020617] via-[#334155] to-[#f59e0b]",
    label: "TRAINING",
    likes: 923,
    caption: "Letzte Runde vor dem Event. Wer ist dabei?",
  },
  {
    id: "bootcamp",
    username: "hotmess",
    verified: true,
    avatar: "HM",
    gradient: "from-[#09090b] via-[#475569] to-[#eab308]",
    label: "BOOTCAMP",
    likes: 1212,
    caption: "Ein Wochenende. Eine Crew. Null Ausreden.",
  },
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
    title: "HYROX x HotMess Challenge",
    date: "Fr., 09. August 2026",
    place: "Wien, Marx Halle",
    category: "Challenge",
    price: 4900,
    gradient: "from-zinc-950 via-slate-700 to-yellow-500",
  },
  {
    id: "boxing",
    title: "Boxing Gala - Title Night",
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
    place: "Klagenfurt, Woerthersee",
    category: "Festival",
    price: 2900,
    gradient: "from-zinc-950 via-emerald-900 to-lime-500",
  },
];

const tabs = [
  { key: "home", label: "Start", Icon: Home },
  { key: "reels", label: "Reels", Icon: PlaySquare },
  { key: "create", label: "Erstellen", Icon: PlusSquare },
  { key: "search", label: "Suchen", Icon: Search },
  { key: "profile", label: "Profil", Icon: User },
];

function money(cents) {
  return new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function HotMess({ color = "#0A0A0A", size = 34 }) {
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
      className="relative grid h-10 w-10 place-items-center rounded-full text-[#0A0A0A] outline-none transition hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-[#FF3040]"
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
    <div className="flex h-8 items-center justify-between px-6 text-xs font-semibold text-[#0A0A0A]">
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

function AppHeader({ onHome, onCreate, onShop, cartCount }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[#EDEDED] px-4">
      <button aria-label="Zurueck zum Feed" className="outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" onClick={onHome}>
        <HotMess />
      </button>
      <div className="flex items-center gap-1">
        <IconButton label="Erstellen" onClick={onCreate}>
          <PlusSquare strokeWidth={2.2} />
        </IconButton>
        <IconButton label="Aktivitaet">
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
    <button className="w-20 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" aria-label={story.username}>
      <span className="relative mx-auto grid h-[68px] w-[68px] place-items-center rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#515BD4] p-[3px]">
        <span className={`grid h-full w-full place-items-center rounded-full border-2 border-white bg-gradient-to-br ${story.color} text-sm font-black text-white`}>
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
        {storyUsers.map((story, index) => (
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
            <button
              aria-label={liked ? "Like entfernen" : "Beitrag liken"}
              className="outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]"
              type="button"
              onClick={onToggleLike}
            >
              <Heart className={liked ? "fill-[#FF3040] text-[#FF3040]" : "text-[#0A0A0A]"} strokeWidth={liked ? 2.8 : 2.1} />
            </button>
            <button aria-label="Kommentieren" className="outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button">
              <MessageCircle />
            </button>
            <button aria-label="Senden" className="outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button">
              <Send />
            </button>
          </div>
          <button aria-label="Speichern" className="outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button">
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

function FeedView({ likedPosts, onToggleLike }) {
  return (
    <>
      <Stories />
      <section>
        {posts.map((post) => (
          <PostCard liked={Boolean(likedPosts[post.id])} key={post.id} post={post} onToggleLike={() => onToggleLike(post.id)} />
        ))}
      </section>
    </>
  );
}

function PlaceholderView({ label }) {
  return (
    <section className="grid min-h-full place-items-center px-8 text-center">
      <div>
        <p className="text-5xl font-black">↯</p>
        <h2 className="mt-4 text-2xl font-black">{label}</h2>
        <p className="mt-2 text-sm text-zinc-500">Bald verfügbar. Tippe unten auf das Haus, um sofort zurück zum Feed zu kommen.</p>
      </div>
    </section>
  );
}

function ShopHeader({ cartCount, onBack, onCart }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#EDEDED] bg-white px-3">
      <IconButton label="Zurueck zum Feed" onClick={onBack}>
        <ChevronLeft />
      </IconButton>
      <h2 className="text-base font-black">Tickets</h2>
      <IconButton label="Warenkorb oeffnen" onClick={onCart} badge={cartCount || null}>
        <ShoppingBag />
      </IconButton>
    </header>
  );
}

function EventCard({ event, quantity, onAdd }) {
  const [flash, setFlash] = useState(false);

  const add = () => {
    onAdd(event.id);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 850);
  };

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
          <button
            className={`rounded-full px-4 py-2 text-sm font-black text-white outline-none transition focus-visible:ring-2 focus-visible:ring-[#FF3040] ${
              flash ? "bg-emerald-600" : "bg-[#0A0A0A]"
            }`}
            type="button"
            onClick={add}
          >
            {flash ? "Hinzugefügt" : quantity > 0 ? `Im Korb (${quantity})` : "In den Korb"}
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
          <h1 className="mt-1 text-2xl font-black">HotMess EVENTS</h1>
        </div>
        {events.map((event) => (
          <EventCard event={event} key={event.id} quantity={cart[event.id] || 0} onAdd={onAdd} />
        ))}
      </section>
    </>
  );
}

function CartView({ cart, onBack, onAdd, onRemove, onCheckout }) {
  const lines = events.filter((event) => cart[event.id]);
  const total = lines.reduce((sum, event) => sum + event.price * cart[event.id], 0);

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-[#EDEDED] bg-white px-3">
        <div className="absolute left-3">
          <IconButton label="Zurueck zu Tickets" onClick={onBack}>
            <ChevronLeft />
          </IconButton>
        </div>
        <h2 className="text-base font-black">Warenkorb</h2>
      </header>
      {lines.length === 0 ? (
        <section className="grid min-h-full place-items-center px-8 text-center">
          <div>
            <ShoppingBag className="mx-auto h-12 w-12" />
            <h2 className="mt-4 text-2xl font-black">Dein Korb ist leer</h2>
            <p className="mt-2 text-sm text-zinc-500">Such dir ein Event aus und sichere dir dein Ticket.</p>
            <button className="mt-5 rounded-full bg-black px-5 py-3 text-sm font-black text-white" type="button" onClick={onBack}>
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
                      className="grid h-9 w-9 place-items-center rounded-full border border-[#EDEDED] outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]"
                      type="button"
                      onClick={() => onRemove(event.id)}
                    >
                      {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </button>
                    <span className="min-w-6 text-center font-black">{quantity}</span>
                    <button
                      aria-label="Menge erhoehen"
                      className="grid h-9 w-9 place-items-center rounded-full bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]"
                      type="button"
                      onClick={() => onAdd(event.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
          <footer className="absolute bottom-[74px] left-0 right-0 border-t border-[#EDEDED] bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Gesamtsumme</span>
              <span className="text-xl font-black">{money(total)}</span>
            </div>
            <button className="mt-3 w-full rounded-full bg-black py-3 text-sm font-black text-white outline-none focus-visible:ring-2 focus-visible:ring-[#FF3040]" type="button" onClick={onCheckout}>
              Zur Kasse
            </button>
          </footer>
        </>
      )}
    </>
  );
}

function BottomNav({ activeTab, onTab }) {
  return (
    <nav className="flex h-[74px] items-center justify-around border-t border-[#EDEDED] bg-white px-1">
      {tabs.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <button
            aria-label={label}
            className="grid h-12 w-16 place-items-center rounded-xl outline-none transition hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-[#FF3040]"
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
  const [activeTab, setActiveTab] = useState("home");
  const [view, setView] = useState("feed");
  const [cart, setCart] = useState({});
  const [likedPosts, setLikedPosts] = useState({});
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, value) => sum + value, 0), [cart]);

  const goHome = () => {
    setActiveTab("home");
    setView("feed");
    setCheckoutMessage("");
  };

  const setTab = (tab) => {
    setActiveTab(tab);
    setView(tab === "home" ? "feed" : "placeholder");
    setCheckoutMessage("");
  };

  const addToCart = (eventId) => {
    setCart((current) => ({ ...current, [eventId]: (current[eventId] || 0) + 1 }));
  };

  const removeFromCart = (eventId) => {
    setCart((current) => {
      const nextQuantity = (current[eventId] || 0) - 1;
      const next = { ...current };
      if (nextQuantity <= 0) delete next[eventId];
      else next[eventId] = nextQuantity;
      return next;
    });
  };

  const openShop = () => {
    setView("shop");
    setCheckoutMessage("");
  };

  const openCart = () => {
    setView("cart");
    setCheckoutMessage("");
  };

  const checkout = () => {
    setCheckoutMessage("Danke! Deine Ticket-Auswahl wurde für die Kasse vorbereitet.");
  };

  const content = (() => {
    if (view === "shop") return <TicketShop cart={cart} cartCount={cartCount} onAdd={addToCart} onBack={goHome} onCart={openCart} />;
    if (view === "cart") return <CartView cart={cart} onAdd={addToCart} onBack={openShop} onCheckout={checkout} onRemove={removeFromCart} />;
    if (activeTab === "home") return <FeedView likedPosts={likedPosts} onToggleLike={(id) => setLikedPosts((current) => ({ ...current, [id]: !current[id] }))} />;
    const label = activeTab === "reels" ? "Reels" : activeTab === "create" ? "Erstellen" : activeTab === "search" ? "Suchen" : "Profil";
    return <PlaceholderView label={label} />;
  })();

  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col bg-white text-[#0A0A0A]">
        <StatusBar />
        <AppHeader cartCount={cartCount} onCreate={() => setTab("create")} onHome={goHome} onShop={openShop} />
        {checkoutMessage ? (
          <div className="absolute left-4 right-4 top-24 z-20 rounded-2xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg">
            {checkoutMessage}
          </div>
        ) : null}
        <main className="min-h-0 flex-1 overflow-y-auto">{content}</main>
        <BottomNav activeTab={activeTab} onTab={setTab} />
      </div>
    </PhoneFrame>
  );
}
