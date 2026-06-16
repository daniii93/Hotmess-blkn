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
  { id: "me", username: "Deine Story", label: "Du", color: "from-hm-champagne to-hm-porcelain text-hm-ink" },
  { id: "hotmess", username: "hotmess", label: "HM", color: "from-hm-ink via-hm-admin to-hm-gold text-hm-porcelain" },
  { id: "innferno_mma", username: "innferno_mma", label: "IM", color: "from-hm-ink via-stone-700 to-hm-goldDeep text-hm-porcelain" },
  { id: "nina.moves", username: "nina.moves", label: "NM", color: "from-hm-dating via-hm-admin to-hm-gold text-hm-porcelain" },
  { id: "fightcrew", username: "fightcrew", label: "FC", color: "from-hm-ink via-hm-business to-hm-champagne text-hm-porcelain" },
];

const posts = [
  {
    id: "fight-night",
    username: "hotmess",
    verified: true,
    avatar: "HM",
    gradient: "from-hm-ink via-hm-admin to-hm-goldDeep",
    label: "Fight Night",
    likes: 1847,
    caption: "HotMess Fight Night Vol. 7. Tickets sind jetzt offen.",
  },
  {
    id: "training",
    username: "innferno_mma",
    verified: false,
    avatar: "IM",
    gradient: "from-hm-ink via-stone-700 to-hm-gold",
    label: "Training",
    likes: 923,
    caption: "Letzte Runde vor dem Event. Wer ist dabei?",
  },
  {
    id: "bootcamp",
    username: "hotmess",
    verified: true,
    avatar: "HM",
    gradient: "from-hm-ink via-hm-business to-hm-champagne",
    label: "Bootcamp",
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
    gradient: "from-hm-ink via-hm-admin to-hm-goldDeep",
  },
  {
    id: "hyrox",
    title: "HYROX x HotMess Challenge",
    date: "Fr., 09. August 2026",
    place: "Wien, Marx Halle",
    category: "Challenge",
    price: 4900,
    gradient: "from-hm-ink via-stone-700 to-hm-gold",
  },
  {
    id: "boxing",
    title: "Boxing Gala - Title Night",
    date: "Sa., 24. August 2026",
    place: "Graz, Orpheum",
    category: "Gala",
    price: 5900,
    gradient: "from-hm-ink via-hm-admin to-hm-dating",
  },
  {
    id: "bootcamp-festival",
    title: "HotMess Bootcamp Festival",
    date: "So., 08. September 2026",
    place: "Klagenfurt, Wörthersee",
    category: "Festival",
    price: 2900,
    gradient: "from-hm-ink via-hm-business to-hm-champagne",
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

function HotMess({ color = "var(--hm-ink)", size = 34 }) {
  return (
    <span className="inline-flex flex-col items-start leading-none" style={{ color }}>
      <span
        className="font-black italic"
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
      className="relative grid h-10 w-10 place-items-center rounded-full text-hm-ink outline-none transition hover:bg-hm-champagne/55 focus-visible:ring-2 focus-visible:ring-hm-gold"
      type="button"
      onClick={onClick}
    >
      {children}
      {badge ? (
        <span className="absolute right-0 top-0 grid min-h-5 min-w-5 place-items-center rounded-full bg-hm-dating px-1 text-[10px] font-bold text-white ring-2 ring-hm-porcelain">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen bg-hm-ivory px-3 py-6">
      <div className="mx-auto h-[780px] max-h-[calc(100vh-48px)] w-full max-w-[390px] overflow-hidden rounded-[42px] border-[10px] border-hm-ink bg-hm-porcelain shadow-luxury">
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-8 items-center justify-between bg-hm-porcelain px-6 text-xs font-semibold text-hm-ink">
      <span>18:26</span>
      <span className="flex items-center gap-2">
        <span>5G</span>
        <span className="h-3 w-6 rounded-sm border border-hm-ink p-[1px]">
          <span className="block h-full w-4 rounded-[1px] bg-hm-ink" />
        </span>
      </span>
    </div>
  );
}

function AppHeader({ onHome, onCreate, onShop, cartCount }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-hm-border bg-hm-porcelain/95 px-4 backdrop-blur">
      <button aria-label="Zurück zum Feed" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-hm-gold" type="button" onClick={onHome}>
        <HotMess />
      </button>
      <div className="flex items-center gap-1">
        <IconButton label="Erstellen" onClick={onCreate}>
          <PlusSquare strokeWidth={2.2} />
        </IconButton>
        <IconButton label="Aktivität">
          <Heart strokeWidth={2.2} />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-hm-dating ring-2 ring-hm-porcelain" />
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
    <button className="w-20 shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-hm-gold" type="button" aria-label={story.username}>
      <span className="relative mx-auto grid h-[68px] w-[68px] place-items-center rounded-full bg-gradient-to-tr from-hm-gold via-hm-dating to-hm-business p-[3px] shadow-soft">
        <span className={`grid h-full w-full place-items-center rounded-full border-2 border-hm-porcelain bg-gradient-to-br ${story.color} text-sm font-black`}>
          {story.label}
        </span>
        {first ? <span className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full bg-hm-ink text-white ring-2 ring-hm-porcelain">+</span> : null}
      </span>
      <span className="mt-1 block truncate text-xs font-semibold text-hm-ink">{story.username}</span>
    </button>
  );
}

function Stories() {
  return (
    <section className="border-b border-hm-border bg-hm-ivory/60 py-3">
      <div className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none]">
        {storyUsers.map((story, index) => (
          <StoryRing first={index === 0} key={story.id} story={story} />
        ))}
      </div>
    </section>
  );
}

function VerifiedBadge() {
  return <span className="grid h-4 w-4 place-items-center rounded-full bg-hm-gold text-[10px] font-black text-white">✓</span>;
}

function PostCard({ post, liked, onToggleLike }) {
  const likeCount = post.likes + (liked ? 1 : 0);

  return (
    <article className="border-b border-hm-border bg-hm-porcelain">
      <header className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-hm-gold via-hm-dating to-hm-business p-[2px]">
            <span className="grid h-full w-full place-items-center rounded-full border-2 border-hm-porcelain bg-hm-ink text-[11px] font-black text-white">{post.avatar}</span>
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-hm-ink">
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
          <p className="text-[11px] font-black uppercase tracking-luxury text-hm-champagne">HotMess</p>
          <p className="hm-display mt-2 text-4xl font-semibold tracking-normal">{post.label}</p>
        </div>
      </div>
      <div className="px-3 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button aria-label={liked ? "Like entfernen" : "Beitrag liken"} className="rounded outline-none focus-visible:ring-2 focus-visible:ring-hm-gold" type="button" onClick={onToggleLike}>
              <Heart className={liked ? "fill-hm-dating text-hm-dating" : "text-hm-ink"} strokeWidth={liked ? 2.8 : 2.1} />
            </button>
            <button aria-label="Kommentieren" className="rounded outline-none focus-visible:ring-2 focus-visible:ring-hm-gold" type="button">
              <MessageCircle />
            </button>
            <button aria-label="Senden" className="rounded outline-none focus-visible:ring-2 focus-visible:ring-hm-gold" type="button">
              <Send />
            </button>
          </div>
          <button aria-label="Speichern" className="rounded outline-none focus-visible:ring-2 focus-visible:ring-hm-gold" type="button">
            <Bookmark />
          </button>
        </div>
        <p className="mt-3 text-sm font-bold text-hm-ink">{likeCount.toLocaleString("de-AT")} Gefällt mir</p>
        <p className="mt-1 text-sm text-hm-ink">
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
        <p className="hm-display text-5xl font-semibold text-hm-gold">↯</p>
        <h2 className="hm-display mt-4 text-3xl font-semibold text-hm-ink">{label}</h2>
        <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Bald verfügbar. Tippe unten auf das Haus, um sofort zurück zum Feed zu kommen.</p>
      </div>
    </section>
  );
}

function ShopHeader({ cartCount, onBack, onCart }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-hm-border bg-hm-porcelain/95 px-3 backdrop-blur">
      <IconButton label="Zurück zum Feed" onClick={onBack}>
        <ChevronLeft />
      </IconButton>
      <h2 className="hm-display text-xl font-semibold text-hm-ink">Tickets</h2>
      <IconButton label="Warenkorb öffnen" onClick={onCart} badge={cartCount || null}>
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
    <article className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain shadow-soft">
      <div className={`relative grid h-40 place-items-center bg-gradient-to-br ${event.gradient} text-white`}>
        <span className="absolute left-3 top-3 rounded-pill border border-hm-gold/25 bg-hm-porcelain px-3 py-1 text-xs font-black uppercase tracking-luxury text-hm-ink">{event.category}</span>
        <span className="absolute bottom-3 right-3 opacity-80">
          <HotMess color="#FFFFFF" size={26} />
        </span>
        <p className="hm-display text-3xl font-semibold uppercase tracking-normal">Tickets</p>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-black leading-tight text-hm-ink">{event.title}</h3>
        <p className="mt-3 flex items-center gap-2 text-sm text-hm-inkSoft">
          <Calendar className="h-4 w-4" /> {event.date}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-hm-inkSoft">
          <MapPin className="h-4 w-4" /> {event.place}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-lg font-black text-hm-ink">{money(event.price)}</span>
          <button
            className={`rounded-pill px-4 py-2 text-sm font-black text-white outline-none transition focus-visible:ring-2 focus-visible:ring-hm-gold ${
              flash ? "bg-hm-success" : "bg-hm-ink hover:bg-hm-goldDeep"
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
          <p className="hm-label">Ticketverkauf</p>
          <h1 className="hm-display mt-1 text-3xl font-semibold text-hm-ink">HotMess Events</h1>
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
      <header className="sticky top-0 z-10 flex h-14 items-center justify-center border-b border-hm-border bg-hm-porcelain/95 px-3 backdrop-blur">
        <div className="absolute left-3">
          <IconButton label="Zurück zu Tickets" onClick={onBack}>
            <ChevronLeft />
          </IconButton>
        </div>
        <h2 className="hm-display text-xl font-semibold text-hm-ink">Warenkorb</h2>
      </header>
      {lines.length === 0 ? (
        <section className="grid min-h-full place-items-center px-8 text-center">
          <div>
            <ShoppingBag className="mx-auto h-12 w-12 text-hm-gold" />
            <h2 className="hm-display mt-4 text-3xl font-semibold text-hm-ink">Dein Korb ist leer</h2>
            <p className="mt-2 text-sm leading-6 text-hm-inkSoft">Such dir ein Event aus und sichere dir dein Ticket.</p>
            <button className="mt-5 rounded-pill bg-hm-ink px-5 py-3 text-sm font-black text-white transition hover:bg-hm-goldDeep" type="button" onClick={onBack}>
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
                <article className="rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-soft" key={event.id}>
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-black leading-tight text-hm-ink">{event.title}</h3>
                      <p className="mt-1 text-sm text-hm-inkSoft">{event.date}</p>
                      <p className="mt-2 text-sm font-bold text-hm-ink">{money(event.price)} pro Ticket</p>
                    </div>
                    <p className="font-black text-hm-ink">{money(event.price * quantity)}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      aria-label={quantity === 1 ? "Entfernen" : "Menge verringern"}
                      className="grid h-9 w-9 place-items-center rounded-full border border-hm-border bg-hm-ivory outline-none focus-visible:ring-2 focus-visible:ring-hm-gold"
                      type="button"
                      onClick={() => onRemove(event.id)}
                    >
                      {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                    </button>
                    <span className="min-w-6 text-center font-black text-hm-ink">{quantity}</span>
                    <button
                      aria-label="Menge erhöhen"
                      className="grid h-9 w-9 place-items-center rounded-full bg-hm-ink text-white outline-none transition hover:bg-hm-goldDeep focus-visible:ring-2 focus-visible:ring-hm-gold"
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
          <footer className="absolute bottom-[74px] left-0 right-0 border-t border-hm-border bg-hm-porcelain/95 p-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm text-hm-inkSoft">Gesamtsumme</span>
              <span className="text-xl font-black text-hm-ink">{money(total)}</span>
            </div>
            <button className="mt-3 w-full rounded-pill bg-hm-ink py-3 text-sm font-black text-white outline-none transition hover:bg-hm-goldDeep focus-visible:ring-2 focus-visible:ring-hm-gold" type="button" onClick={onCheckout}>
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
    <nav className="flex h-[74px] items-center justify-around border-t border-hm-border bg-hm-porcelain px-1">
      {tabs.map(({ key, label, Icon }) => {
        const active = activeTab === key;
        return (
          <button
            aria-label={label}
            className={`grid h-12 w-16 place-items-center rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-hm-gold ${
              active ? "bg-hm-champagne text-hm-ink shadow-soft" : "text-hm-inkSoft hover:bg-hm-champagne/45"
            }`}
            key={key}
            type="button"
            onClick={() => onTab(key)}
          >
            <Icon className={active ? "fill-hm-ink text-hm-ink" : "text-hm-inkSoft"} strokeWidth={active ? 3 : 2} />
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
      <div className="relative flex h-full flex-col bg-hm-ivory text-hm-ink">
        <StatusBar />
        <AppHeader cartCount={cartCount} onCreate={() => setTab("create")} onHome={goHome} onShop={openShop} />
        {checkoutMessage ? (
          <div className="absolute left-4 right-4 top-24 z-20 rounded-card border border-hm-success/20 bg-hm-success px-4 py-3 text-center text-sm font-bold text-white shadow-luxury">
            {checkoutMessage}
          </div>
        ) : null}
        <main className="min-h-0 flex-1 overflow-y-auto">{content}</main>
        <BottomNav activeTab={activeTab} onTab={setTab} />
      </div>
    </PhoneFrame>
  );
}
