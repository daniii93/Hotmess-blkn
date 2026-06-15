"use client";

import Link from "next/link";
import { useState } from "react";

const card = "rounded-card border border-hm-border bg-hm-porcelain shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory";

export function StoryBar() {
  const stories = ["+", "Ana", "Marko", "Lena", "Nexo"];
  return (
    <section className={`${card} overflow-x-auto p-4`}>
      <div className="flex gap-4">
        {stories.map((story) => (
          <Link className="flex min-w-20 flex-col items-center gap-2 text-xs text-hm-inkSoft" href={story === "+" ? "/create" : "/feed/stories/demo"} key={story}>
            <span className="grid size-14 place-items-center rounded-full border border-hm-gold bg-hm-champagne font-semibold text-hm-ink">
              {story.slice(0, 1)}
            </span>
            <span>{story === "+" ? "Deine Story" : story}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PostCard() {
  const [liked, setLiked] = useState(false);
  return (
    <article className={card}>
      <header className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-full border border-hm-gold bg-hm-ivory text-sm font-semibold">A</div>
          <div>
            <p className="font-semibold text-hm-ink">Ana Markovic</p>
            <p className="text-xs text-hm-inkSoft">@ana · Innsbruck</p>
          </div>
        </div>
        <button className="rounded-full px-3 py-2 text-hm-inkSoft" type="button">...</button>
      </header>
      <div className="aspect-[4/5] bg-[linear-gradient(135deg,var(--hm-champagne),var(--hm-porcelain))]" />
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-3 text-sm font-semibold text-hm-ink">
          <button onClick={() => setLiked((value) => !value)} type="button">{liked ? "Gefällt dir" : "Gefällt mir"}</button>
          <button type="button">Kommentieren</button>
          <button type="button">Teilen</button>
          <button className="ml-auto" type="button">Speichern</button>
        </div>
        <p className="text-sm font-semibold text-hm-ink">{liked ? "129" : "128"} Gefällt mir</p>
        <p className="text-sm leading-7 text-hm-ink">
          Balkan night, warm faces, first row energy. <span className="text-hm-goldDeep">#hotmess #innsbruck</span>
        </p>
        <p className="text-sm text-hm-inkSoft">Kommentare ansehen (14)</p>
      </div>
    </article>
  );
}

export function EventCardInline() {
  return (
    <article className={`${card} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Event-Aktivität</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">Marko und 3 Freunde gehen zu HotMess Innsbruck</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white" href="/events/innsbruck-2026-09/checkout">
          Ich auch
        </Link>
        <Link className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink" href="/events/innsbruck-2026-09">
          Event ansehen
        </Link>
      </div>
    </article>
  );
}

export function FeedList() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <PostCard />
      <EventCardInline />
      <PostCard />
    </section>
  );
}

export function StoryViewer() {
  return (
    <main className="min-h-screen bg-hm-ink px-4 py-6 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-between rounded-card border border-hm-gold/40 bg-[#2a241d] p-5 shadow-luxury">
        <StoryProgress />
        <div className="text-center">
          <p className="text-xs uppercase tracking-luxury text-hm-gold">Story</p>
          <h1 className="hm-display mt-3 text-4xl">Ich bin dabei</h1>
          <p className="mt-3 text-sm text-hm-champagne">HotMess-gebrandete Event-Story mit Antworten, Reaktion und Umfrage.</p>
        </div>
        <StoryReactions />
      </section>
    </main>
  );
}

export function StoryProgress() {
  return <div className="h-1 rounded-full bg-hm-gold" />;
}

export function StoryReactions() {
  return (
    <div className="flex items-center gap-2 rounded-pill border border-hm-gold/40 bg-black/20 p-2">
      {["Antworten", "Like", "Umfrage"].map((item) => (
        <button className="rounded-pill px-4 py-2 text-sm text-hm-champagne hover:bg-white/10" key={item} type="button">{item}</button>
      ))}
    </div>
  );
}

export function PollSticker() {
  return (
    <div className={`${soft} p-4`}>
      <p className="font-semibold text-hm-ink">Afterparty?</p>
      <div className="mt-3 grid gap-2">
        {["Ja", "Vielleicht"].map((option) => (
          <button className="rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" key={option} type="button">{option}</button>
        ))}
      </div>
    </div>
  );
}

export function MediaUploader() {
  return (
    <div className={`${soft} p-5`}>
      <p className="font-semibold text-hm-ink">Medien hochladen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Bis zu 10 Medien, Reihenfolge per Drag vorbereitet.</p>
    </div>
  );
}

export function HashtagInput() {
  return (
    <label className={`${soft} block p-5`}>
      <span className="font-semibold text-hm-ink">Caption</span>
      <textarea className="mt-3 min-h-32 w-full rounded-card border border-hm-border bg-hm-porcelain p-4 outline-none focus:border-hm-gold" placeholder="#hashtags und @mentions" />
    </label>
  );
}

export function CreatePost() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Neuer Beitrag</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Teile einen Moment</h1>
      <div className="mt-6 grid gap-4">
        <MediaUploader />
        <HashtagInput />
        <button className="w-fit rounded-pill bg-hm-ink px-6 py-3 text-sm font-semibold text-white" type="button">Teilen</button>
      </div>
    </section>
  );
}

export function CreateStory() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Story erstellen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Foto, Video, Event-Story, Badge, Geburtstag, Umfrage oder Frage.</p>
    </section>
  );
}

export function FriendActivityFeed() {
  const items = [
    ["Jetzt", "marko hat ein Ticket für HotMess Innsbruck gekauft"],
    ["Heute", "ana und stefan gehen beide zu HotMess Innsbruck"],
    ["Diese Woche", "nexo hat Badge Party Starter freigeschaltet"],
  ];
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Was ist los?</p>
      <div className="mt-6 space-y-3">
        {items.map(([time, text]) => (
          <ActivityItem key={text} text={text} time={time} />
        ))}
      </div>
    </section>
  );
}

export function ActivityItem({ text, time }: { text: string; time: string }) {
  return (
    <div className={`${soft} flex flex-wrap items-center justify-between gap-4 p-4`}>
      <div>
        <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">{time}</p>
        <p className="mt-1 font-semibold text-hm-ink">{text}</p>
      </div>
      <IchAuchButton />
    </div>
  );
}

export function IchAuchButton() {
  return (
    <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white" href="/events/innsbruck-2026-09/checkout">
      Ich auch
    </Link>
  );
}

export function ConversationList() {
  return (
    <section className={`${card} p-4`}>
      <div className="flex gap-2">
        <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-semibold text-white" type="button">Chats</button>
        <button className="rounded-pill border border-hm-gold px-4 py-2 text-sm font-semibold text-hm-ink" type="button">Anfragen (2)</button>
      </div>
      <div className="mt-4 space-y-3">
        {["Ana", "Event-Chat Innsbruck", "Business Match"].map((name) => (
          <Link className={`${soft} flex items-center gap-3 p-4`} href="/chat/demo" key={name}>
            <span className="grid size-11 place-items-center rounded-full border border-hm-gold bg-hm-champagne text-sm font-semibold">{name.slice(0, 1)}</span>
            <span>
              <span className="block font-semibold text-hm-ink">{name}</span>
              <span className="text-sm text-hm-inkSoft">Letzte Chat-Aktivität · ungelesen</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function RequestsFolder() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Anfragen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Nicht-Freunde landen hier mit Annehmen, Ablehnen und Melden.</p>
    </section>
  );
}

export function MessageBubble({ mine = false, text }: { mine?: boolean; text: string }) {
  return (
    <div className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm ${mine ? "ml-auto bg-hm-ink text-white" : "bg-hm-champagne text-hm-ink"}`}>
      {text}
    </div>
  );
}

export function MessageComposer() {
  return (
    <div className="flex gap-2 rounded-card border border-hm-border bg-hm-porcelain p-3">
      <button className="rounded-full border border-hm-gold px-3 text-hm-ink" type="button">+</button>
      <input className="min-w-0 flex-1 bg-transparent px-2 outline-none" placeholder="Chat schreiben" />
      <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-semibold text-white" type="button">Senden</button>
    </div>
  );
}

export function ChatThread() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8">
      <section className={`${card} flex min-h-[75vh] flex-col p-4`}>
        <header className="border-b border-hm-border pb-4">
          <p className="font-semibold text-hm-ink">Ana Markovic</p>
          <p className="text-sm text-hm-inkSoft">Online · Standard/Vanish/Snap vorbereitet</p>
        </header>
        <div className="flex-1 space-y-3 py-5">
          <MessageBubble text="Gehst du zu HotMess Innsbruck?" />
          <MessageBubble mine text="Ja, ich teile dir das Event." />
          <EventShareTab />
          <ReplyPreview />
        </div>
        <MessageComposer />
      </section>
    </main>
  );
}

export function EventShareTab() {
  return (
    <div className={`${soft} ml-auto max-w-sm p-4`}>
      <p className="text-xs uppercase tracking-luxury text-hm-goldDeep">Event teilen</p>
      <p className="mt-2 font-semibold text-hm-ink">HotMess Innsbruck</p>
      <Link className="mt-3 inline-flex rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" href="/events/innsbruck-2026-09">Öffnen</Link>
    </div>
  );
}

export function VoiceRecorder() {
  return <button className="rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" type="button">Voice aufnehmen</button>;
}

export function LiveLocationShare() {
  return <button className="rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" type="button">Standort teilen</button>;
}

export function ReactionPicker() {
  return <div className="flex gap-2 text-xl">👍 ❤️ 🔥 🎉</div>;
}

export function ReplyPreview() {
  return <div className="rounded-card border-l-4 border-hm-gold bg-hm-ivory p-3 text-sm text-hm-inkSoft">Antwort auf: Wann treffen wir uns?</div>;
}

export function NotificationTabs() {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {["Alle", "Personen denen du folgst", "Anfragen", "Likes", "Kommentare", "Erwähnungen"].map((tab) => (
        <button className="rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" key={tab} type="button">{tab}</button>
      ))}
    </div>
  );
}

export function BundledNotification() {
  return (
    <div className={`${soft} p-4`}>
      <p className="font-semibold text-hm-ink">ana, stefan und 10 weitere mögen deinen Beitrag</p>
      <p className="mt-1 text-sm text-hm-inkSoft">Gebündelt über notification_bundles · vor 1 Std</p>
    </div>
  );
}

export function NotificationCenter() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <NotificationTabs />
      <div className="mt-5 space-y-3">
        <BundledNotification />
        <div className={`${soft} p-4`}>
          <p className="font-semibold text-hm-ink">Du bist auf der Warteliste dran</p>
          <p className="mt-1 text-sm text-hm-inkSoft">Ticket · 20 Minuten Zeitfenster</p>
        </div>
      </div>
    </section>
  );
}

export function SearchBar() {
  return <input className="w-full rounded-pill border border-hm-border bg-hm-porcelain px-5 py-4 outline-none focus:border-hm-gold" placeholder="Suche nach Personen, Events, Hashtags oder Orten" />;
}

export function PeopleYouMayKnow() {
  return (
    <section className={`${card} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Personen die du kennen könntest</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {["Ana", "Marko", "Lena", "Nexo"].map((name) => (
          <div className={`${soft} flex items-center justify-between gap-3 p-4`} key={name}>
            <span className="font-semibold text-hm-ink">{name}</span>
            <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm text-white" type="button">Folgen</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrendingTags() {
  return (
    <section className={`${card} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Trending Hashtags</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {["#hotmess", "#balkan", "#innsbruck", "#afterparty"].map((tag) => (
          <span className="rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" key={tag}>{tag}</span>
        ))}
      </div>
    </section>
  );
}

export function DiscoverGrid() {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <PeopleYouMayKnow />
      <TrendingTags />
    </section>
  );
}

export function NotificationBell() {
  return <Link className="rounded-full border border-hm-gold px-3 py-2 text-sm text-hm-ink" href="/notifications">3</Link>;
}

export function PokeButton() {
  return <button className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink" type="button">Anstupsen</button>;
}

export function ReportDialog() {
  return (
    <div className={`${soft} p-4`}>
      <p className="font-semibold text-hm-ink">Melden</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Spam, Belästigung, Fake-Profil oder unangemessener Inhalt.</p>
    </div>
  );
}
