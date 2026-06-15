"use client";

import Link from "next/link";
import { useState } from "react";

const card = "rounded-card border border-hm-border bg-hm-porcelain shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory";

export function EventFilterBanner() {
  return (
    <section className={`${card} border-hm-dating/30 p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Event-Filter</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">47 Dating-Mitglieder gehen zu HotMess Innsbruck</h2>
      <p className="mt-3 text-sm leading-7 text-hm-inkSoft">
        Entdecke nur Menschen, die zum selben Event gehen. Der Kontext ist der USP von HotMess Dating.
      </p>
      <Link className="mt-5 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/dating?filter=event">
        Event-Matches entdecken
      </Link>
    </section>
  );
}

export function EventProfileBadge() {
  return (
    <div className="rounded-pill border border-hm-dating/50 bg-hm-champagne px-4 py-2 text-xs font-semibold uppercase tracking-luxury text-hm-dating">
      Geht zu HotMess Innsbruck
    </div>
  );
}

export function ProfileCard() {
  return (
    <article className={`${card} overflow-hidden`}>
      <div className="relative aspect-[4/5] bg-[radial-gradient(circle_at_30%_20%,rgba(156,74,60,.25),transparent_32%),linear-gradient(135deg,var(--hm-champagne),var(--hm-porcelain))]">
        <div className="absolute left-5 top-5">
          <EventProfileBadge />
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h1 className="hm-display text-4xl text-hm-ink">Ana, 27</h1>
          <p className="mt-1 text-sm text-hm-inkSoft">Verifiziert · Innsbruck · 4 km</p>
        </div>
        <p className="text-sm leading-7 text-hm-ink">
          Events, Balkan nights und gute Gespräche vor dem ersten Drink.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Dates", "DE/SR-HR", "House", "Clubbing"].map((tag) => (
            <span className="rounded-pill border border-hm-borderSoft px-3 py-1 text-xs text-hm-inkSoft" key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  );
}

export function SwipeActions() {
  return (
    <div className="flex items-center justify-center gap-3">
      {["Nein", "SuperLike", "Gefällt mir"].map((label) => (
        <button
          className={`rounded-pill px-5 py-3 text-sm font-semibold ${
            label === "Gefällt mir" ? "bg-hm-dating text-white" : "border border-hm-dating/40 text-hm-ink"
          }`}
          key={label}
          type="button"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SuperLikeButton() {
  return <button className="rounded-pill border border-hm-dating px-4 py-2 text-sm text-hm-dating" type="button">SuperLike</button>;
}

export function RewindButton() {
  return <button className="rounded-pill border border-hm-border px-4 py-2 text-sm text-hm-ink" type="button">Zurück</button>;
}

export function BoostButton() {
  return <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-semibold text-white" type="button">Boost</button>;
}

export function SwipeStack() {
  return (
    <section className="mx-auto max-w-md space-y-5">
      <ProfileCard />
      <SwipeActions />
      <div className="flex justify-center gap-2">
        <RewindButton />
        <SuperLikeButton />
        <BoostButton />
      </div>
    </section>
  );
}

export function WhoLikesYou() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Wer mag dich</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">12 Menschen mögen dich</h1>
      <p className="mt-3 text-sm text-hm-inkSoft">Free und Plus sehen verschwommene Karten. Gold und Platinum sehen klare Profile.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {["A", "M", "L"].map((letter) => (
          <div className={`${soft} grid aspect-[3/4] place-items-center text-4xl font-semibold text-hm-dating blur-[1px]`} key={letter}>
            {letter}
          </div>
        ))}
      </div>
    </section>
  );
}

export function MatchModal() {
  return (
    <div className={`${soft} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Match</p>
      <p className="mt-2 font-semibold text-hm-ink">Ihr geht beide zu HotMess Innsbruck.</p>
      <Link className="mt-4 inline-flex rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" href="/chat/demo">
        Nachricht senden
      </Link>
    </div>
  );
}

export function RoomBookingPrompt() {
  return (
    <div className={`${soft} p-5`}>
      <p className="font-semibold text-hm-ink">Gemeinsam übernachten?</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Nur wenn beide zustimmen, wird der Hotel-Code-Hinweis geteilt. Ablehnung bleibt diskret.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Ich bin dabei", "Nein", "Später"].map((item) => (
          <button className="rounded-pill border border-hm-dating/40 px-4 py-2 text-sm text-hm-ink" key={item} type="button">{item}</button>
        ))}
      </div>
    </div>
  );
}

export function MatchList() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Matches</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <MatchModal />
        <RoomBookingPrompt />
      </div>
    </section>
  );
}

export function DatingProfileEditor() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Dating-Profil</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Getrennt vom Hauptprofil</h1>
      <div className="mt-6 grid gap-4">
        <div className={`${soft} p-4`}>
          <p className="font-semibold text-hm-ink">Fotos</p>
          <p className="mt-2 text-sm text-hm-inkSoft">Bis zu 6 Dating-Fotos, erstes Foto als Hauptbild.</p>
        </div>
        <textarea className="min-h-32 rounded-card border border-hm-border bg-hm-ivory p-4 outline-none focus:border-hm-dating" placeholder="Bio bis 300 Zeichen" />
        <div className="grid gap-3 sm:grid-cols-2">
          {["Casual", "Dates", "Beziehung", "Offen"].map((goal) => (
            <button className="rounded-pill border border-hm-dating/40 px-4 py-3 text-sm text-hm-ink" key={goal} type="button">{goal}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DatingFilters() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Filter</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {["Frauen / Männer / Alle", "Alter 18-99", "Distanz 50 km", "Nur Event-Teilnehmer", "Nur Verifizierte"].map((filter) => (
          <div className={`${soft} p-4 font-semibold text-hm-ink`} key={filter}>{filter}</div>
        ))}
      </div>
    </section>
  );
}

const tiers = [
  ["Plus", "Unbegrenzt swipen, Rewind, 5 SuperLikes/Tag, Passport, 1 Boost/Monat"],
  ["Gold", "Alles aus Plus, Wer mag dich, goldener Rahmen"],
  ["Platinum", "Priority Likes, First Impressions, SuperLike mit Notiz, Platin-Rahmen"],
];

export function PremiumTiers() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-dating">Premium</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {tiers.map(([tier, text]) => (
          <div className={`${soft} p-5`} key={tier}>
            <h2 className="hm-display text-3xl text-hm-ink">{tier}</h2>
            <p className="mt-3 text-sm leading-7 text-hm-inkSoft">{text}</p>
            <button className="mt-5 rounded-pill bg-hm-dating px-5 py-3 text-sm font-semibold text-white" type="button">{tier} wählen</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ConsumableShop() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Einzelkäufe</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Boost 1", "Boost 5", "SuperLike 5", "SuperLike 25"].map((item) => (
          <button className="rounded-pill border border-hm-dating/40 px-4 py-2 text-sm text-hm-ink" key={item} type="button">{item}</button>
        ))}
      </div>
    </section>
  );
}
