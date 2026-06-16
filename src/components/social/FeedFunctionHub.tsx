"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  Film,
  Heart,
  Home,
  MapPin,
  Minus,
  Plus,
  PlusSquare,
  Search,
  ShoppingBag,
  Ticket,
  Trash2,
  User,
  X,
} from "lucide-react";

type Panel = "none" | "activity" | "shop" | "cart" | "checkout";
type Cart = Record<string, number>;
type Order = { count: number; total: number };

const events = [
  {
    id: "fight-night",
    title: "HotMess Fight Night Vol. 7",
    date: "Sa, 29. Juni 2026",
    location: "Innsbruck, Club Stage",
    category: "Fight Night",
    price: 3900,
    gradient: "from-hm-ink via-hm-wine to-hm-goldDeep",
  },
  {
    id: "hyrox",
    title: "HYROX x HotMess Challenge",
    date: "Fr, 12. Juli 2026",
    location: "Messe Innsbruck",
    category: "Challenge",
    price: 2900,
    gradient: "from-hm-forest via-hm-ink to-hm-gold",
  },
  {
    id: "boxing-gala",
    title: "Boxing Gala - Title Night",
    date: "Sa, 27. Juli 2026",
    location: "BLKN Arena",
    category: "Gala",
    price: 5900,
    gradient: "from-hm-wine via-hm-ink to-hm-champagne",
  },
  {
    id: "bootcamp",
    title: "HotMess Bootcamp Festival",
    date: "So, 18. August 2026",
    location: "Outdoor Park Tirol",
    category: "Festival",
    price: 2400,
    gradient: "from-hm-goldDeep via-hm-gold to-hm-champagne",
  },
];

const money = (cents: number) => new Intl.NumberFormat("de-AT", { style: "currency", currency: "EUR" }).format(cents / 100);

function HotMessMark({ light = false }: { light?: boolean }) {
  return (
    <span className={light ? "hm-display text-xl italic text-white" : "hm-display text-xl italic text-hm-ink"}>
      HotMess
    </span>
  );
}

function IconButton({
  label,
  children,
  badge,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  badge?: number | "dot";
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      className="relative grid size-11 place-items-center rounded-full border border-hm-border bg-hm-ivory text-hm-ink transition active:scale-95"
      onClick={onClick}
      type="button"
    >
      {children}
      {badge ? (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-hm-ivory bg-hm-danger px-1 text-[10px] font-bold text-white">
          {badge === "dot" ? "" : badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: typeof Film; label: string }) {
  return (
    <Link
      className="flex items-center gap-2 rounded-full border border-hm-borderSoft bg-hm-ivory px-3 py-2 text-xs font-semibold text-hm-ink transition hover:border-hm-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-hm-gold"
      href={href}
    >
      <Icon aria-hidden className="size-4" />
      {label}
    </Link>
  );
}

export function FeedFunctionHub() {
  const [panel, setPanel] = useState<Panel>("none");
  const [cart, setCart] = useState<Cart>({});
  const [order, setOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, qty) => sum + qty, 0), [cart]);
  const cartTotal = useMemo(
    () => events.reduce((sum, event) => sum + (cart[event.id] ?? 0) * event.price, 0),
    [cart],
  );
  const cartItems = events.filter((event) => cart[event.id]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  }

  function addToCart(id: string) {
    setCart((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
    showNotice("Hinzugefuegt");
  }

  function changeQty(id: string, delta: number) {
    setCart((current) => {
      const nextQty = (current[id] ?? 0) + delta;
      const next = { ...current };
      if (nextQty <= 0) {
        delete next[id];
      } else {
        next[id] = nextQty;
      }
      return next;
    });
  }

  function checkout() {
    if (!cartCount) return;
    setOrder({ count: cartCount, total: cartTotal });
    setCart({});
    setPanel("checkout");
    showNotice("Bestellung bestaetigt");
  }

  return (
    <section className="relative mx-auto w-full max-w-3xl rounded-card border border-hm-border bg-hm-porcelain p-4 shadow-luxury">
      {notice ? (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full bg-hm-ink px-4 py-2 text-xs font-semibold text-white shadow-luxury">
          {notice}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-hm-goldDeep">Schnellzugriff</p>
          <h2 className="hm-display text-2xl text-hm-ink">Feed-Funktionen</h2>
        </div>
        <div className="flex items-center gap-2">
          <IconButton badge="dot" label="Aktivitaet oeffnen" onClick={() => setPanel("activity")}>
            <Heart className="size-5" />
          </IconButton>
          <IconButton badge={cartCount || undefined} label="Tickets oeffnen" onClick={() => setPanel("shop")}>
            <ShoppingBag className="size-5" />
          </IconButton>
          {panel !== "none" ? (
            <IconButton label="Funktionen schliessen" onClick={() => setPanel("none")}>
              <X className="size-5" />
            </IconButton>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <QuickLink href="/watch" icon={Film} label="Watch" />
        <QuickLink href="/create" icon={PlusSquare} label="Erstellen" />
        <QuickLink href="/explore" icon={Search} label="Entdecken" />
        <QuickLink href="/profile" icon={User} label="Profil" />
      </div>

      {panel === "activity" ? (
        <div className="mt-4 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="hm-display text-xl text-hm-ink">Aktivitaet</h3>
            <button className="text-xs font-semibold text-hm-goldDeep" onClick={() => setPanel("none")} type="button">
              Zurueck zum Feed
            </button>
          </div>
          <div className="space-y-3 text-sm text-hm-ink">
            <p className="rounded-card bg-hm-porcelain p-3">Neue Likes und Antworten erscheinen hier als Feed-Einstieg.</p>
            <p className="rounded-card bg-hm-porcelain p-3">Tickets sind direkt erreichbar, ohne die Feed-Seite zu verlassen.</p>
            <button
              className="inline-flex items-center gap-2 rounded-full bg-hm-ink px-4 py-2 text-sm font-semibold text-white transition active:scale-95"
              onClick={() => setPanel("shop")}
              type="button"
            >
              <Ticket className="size-4" />
              Tickets ansehen
            </button>
          </div>
        </div>
      ) : null}

      {panel === "shop" ? (
        <div className="mt-4 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-hm-inkSoft" onClick={() => setPanel("none")} type="button">
              <ChevronLeft className="size-4" />
              Feed
            </button>
            <h3 className="hm-display text-xl text-hm-ink">HotMess Events</h3>
            <button
              className="relative grid size-10 place-items-center rounded-full bg-hm-porcelain text-hm-ink"
              onClick={() => setPanel("cart")}
              type="button"
              aria-label="Warenkorb oeffnen"
            >
              <ShoppingBag className="size-5" />
              {cartCount ? <span className="absolute -right-1 -top-1 rounded-full bg-hm-danger px-1.5 text-[10px] font-bold text-white">{cartCount}</span> : null}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => (
              <article className="overflow-hidden rounded-card border border-hm-border bg-hm-porcelain" key={event.id}>
                <div className={`relative grid h-36 place-items-center bg-gradient-to-br ${event.gradient}`}>
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-hm-ink">{event.category}</span>
                  <div className="opacity-85">
                    <HotMessMark light />
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <h4 className="font-semibold text-hm-ink">{event.title}</h4>
                  <p className="flex items-center gap-2 text-xs text-hm-inkSoft">
                    <Calendar className="size-4" />
                    {event.date}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-hm-inkSoft">
                    <MapPin className="size-4" />
                    {event.location}
                  </p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="hm-display text-xl text-hm-ink">{money(event.price)}</span>
                    <button
                      className="rounded-full bg-hm-ink px-4 py-2 text-xs font-semibold text-white transition hover:bg-hm-goldDeep active:scale-95"
                      onClick={() => addToCart(event.id)}
                      type="button"
                    >
                      {cart[event.id] ? `Im Korb (${cart[event.id]})` : "In den Korb"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {panel === "cart" ? (
        <div className="mt-4 rounded-card border border-hm-borderSoft bg-hm-ivory p-4">
          <div className="mb-4 flex items-center justify-between">
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-hm-inkSoft" onClick={() => setPanel("shop")} type="button">
              <ChevronLeft className="size-4" />
              Tickets
            </button>
            <h3 className="hm-display text-xl text-hm-ink">Warenkorb</h3>
            <button className="grid size-10 place-items-center rounded-full bg-hm-porcelain text-hm-ink" onClick={() => setPanel("none")} type="button" aria-label="Zurueck zum Feed">
              <Home className="size-5" />
            </button>
          </div>
          {cartItems.length === 0 ? (
            <div className="rounded-card bg-hm-porcelain p-5 text-center">
              <p className="text-sm text-hm-inkSoft">Dein Warenkorb ist leer.</p>
              <button className="mt-3 rounded-full bg-hm-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setPanel("shop")} type="button">
                Tickets ansehen
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((event) => (
                <div className="flex items-center justify-between gap-3 rounded-card bg-hm-porcelain p-3" key={event.id}>
                  <div>
                    <p className="font-semibold text-hm-ink">{event.title}</p>
                    <p className="text-xs text-hm-inkSoft">{money(event.price)} pro Ticket</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="grid size-8 place-items-center rounded-full bg-hm-ivory" onClick={() => changeQty(event.id, -1)} type="button" aria-label="Menge verringern">
                      {cart[event.id] === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
                    </button>
                    <span className="min-w-5 text-center text-sm font-semibold">{cart[event.id]}</span>
                    <button className="grid size-8 place-items-center rounded-full bg-hm-ink text-white" onClick={() => changeQty(event.id, 1)} type="button" aria-label="Menge erhoehen">
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-hm-border pt-4">
                <span className="font-semibold text-hm-ink">Gesamtsumme</span>
                <span className="hm-display text-2xl text-hm-ink">{money(cartTotal)}</span>
              </div>
              <button className="w-full rounded-full bg-hm-goldDeep px-5 py-3 font-semibold text-white transition active:scale-95" onClick={checkout} type="button">
                Zur Kasse
              </button>
            </div>
          )}
        </div>
      ) : null}

      {panel === "checkout" ? (
        <div className="mt-4 rounded-card border border-hm-borderSoft bg-hm-ivory p-5 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <Check className="size-7" />
          </span>
          <h3 className="hm-display mt-3 text-2xl text-hm-ink">Bestellung bestaetigt</h3>
          <p className="mt-2 text-sm text-hm-inkSoft">
            {order ? `${order.count} Ticket${order.count === 1 ? "" : "s"} - ${money(order.total)}` : "Deine Bestellung wurde vorbereitet."}
          </p>
          <p className="mt-1 text-xs text-hm-inkSoft">Die Bestaetigung wird per E-Mail gesendet.</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button className="rounded-full bg-hm-ink px-4 py-2 text-sm font-semibold text-white" onClick={() => setPanel("none")} type="button">
              Zurueck zum Feed
            </button>
            <button className="rounded-full border border-hm-border bg-hm-porcelain px-4 py-2 text-sm font-semibold text-hm-ink" onClick={() => setPanel("shop")} type="button">
              Weitere Tickets ansehen
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
