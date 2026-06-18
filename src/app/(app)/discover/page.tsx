import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Bot,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  Gift,
  MapPin,
  MessageCircle,
  PlusCircle,
  Sparkles,
  Ticket,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";
import { getDiscoverData } from "@/features/discover/service";
import { formatEventDate } from "@/features/events/format";

export const dynamic = "force-dynamic";

export default async function DiscoverPage() {
  const data = await getDiscoverData();
  const firstName = data.profile?.first_name ?? data.profile?.username ?? "HotMess";
  const city = data.profile?.city ?? null;
  const isAdmin = data.profile?.role === "admin";
  const isScanner = data.profile?.role === "scanner" || data.profile?.role === "admin";
  const isProvider = data.localMe?.providerProfile?.verificationStatus === "verified";

  const recommendations = [
    {
      title: data.events[0]?.title ?? "Events entdecken",
      text: data.events[0] ? `${data.events[0].city} · ${formatEventDate(data.events[0].dateStart)}` : "Finde kommende HotMess Events und sichere dir dein Ticket.",
      label: data.events[0] ? "Neues Event fuer dich" : "Guter Startpunkt",
      href: data.events[0] ? `/events/${data.events[0].slug}` : "/events",
      icon: CalendarDays,
    },
    {
      title: data.businessMe?.businessEnabled ? "Business Chancen" : "Business-Profil aktivieren",
      text: data.businessMe?.businessEnabled ? "Neue Kontakte, Jobs und Gruppen fuer dein Netzwerk." : "Entdecke berufliche Kontakte, Jobs und Partnerschaften.",
      label: data.businessMe?.businessEnabled ? "Weil Business aktiv ist" : "Optionales Modul",
      href: "/business",
      icon: Briefcase,
    },
    {
      title: isProvider ? "Neue Leads pruefen" : "Dienstleistung suchen",
      text: isProvider ? "Anbieter-Dashboard oeffnen und neue Anfragen bearbeiten." : "Stelle einen Auftrag ein und erhalte Angebote von verifizierten Anbietern.",
      label: isProvider ? "Anbieter-Modus" : "Verifizierte Anbieter",
      href: isProvider ? "/local-services/company/dashboard" : "/local-services/create",
      icon: Wrench,
    },
  ];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <p className="hm-label text-hm-goldDeep">Discover</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1 className="hm-display text-4xl text-hm-ink sm:text-6xl">
              Entdecke echte Menschen, Events, Angebote und Moeglichkeiten in deiner Naehe.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
              Hallo {firstName}. HotMess zeigt dir, was fuer dich relevant ist: verifizierte Mitglieder,
              Events, Business-Kontakte, Dienstleistungen und Vorteile. Echte Menschen. Echte Events.
              Echte Geschaefte. Echte Vorteile.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Events entdecken" />
            <HeroButton href="/explore/people" icon={<UserRound className="h-4 w-4" />} label="Menschen finden" />
            <HeroButton href="/create" icon={<PlusCircle className="h-4 w-4" />} label="Beitrag erstellen" />
            <HeroButton href="/services" icon={<Wrench className="h-4 w-4" />} label="Dienstleistung suchen" />
            <HeroButton href="/creator" icon={<Sparkles className="h-4 w-4" />} label="Creator Wissen" />
            <HeroButton href="/digital-ai" icon={<Bot className="h-4 w-4" />} label="Digital & AI" />
            <HeroButton href="/membership" icon={<Gift className="h-4 w-4" />} label="HotMess Plus" />
          </div>
        </div>
      </section>

      <Section title="Persoenliche Empfehlungen" href="/explore" cta="Mehr entdecken">
        <div className="grid gap-4 md:grid-cols-3">
          {recommendations.map(({ title, text, label, href, icon: Icon }) => (
            <ActionCard key={title} href={href} icon={<Icon className="h-5 w-5" />} title={title} text={text} label={label} />
          ))}
        </div>
      </Section>

      <Section title="Stories" href="/feed" cta="Feed oeffnen">
        {data.stories.length ? (
          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <StoryCreateCard />
            {data.stories.map((story) => (
              <Link key={story.id} href={`/feed/stories/${story.id}`} className="w-28 shrink-0 rounded-card border border-hm-border bg-hm-porcelain p-3 shadow-luxury">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-hm-gold via-hm-champagne to-hm-ink p-0.5">
                  <div className="grid h-full w-full place-items-center rounded-full bg-hm-ivory text-xs font-bold text-hm-ink">
                    {story.author.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <p className="mt-3 truncate text-xs font-bold text-hm-ink">@{story.author.username}</p>
                <p className="mt-1 line-clamp-2 text-xs text-hm-inkSoft">{story.textOverlay ?? "Story ansehen"}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="Sobald Freunde, Events oder Unternehmen Stories teilen, erscheinen sie hier." href="/create" cta="Story erstellen" />
        )}
      </Section>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section title={city ? `Heute in ${city}` : "Aktuell auf HotMess"} href="/settings" cta={city ? "Standort bearbeiten" : "Standort ergaenzen"}>
          <div className="grid gap-3">
            {data.events.slice(0, 2).map((event) => (
              <MiniRow key={event.id} href={`/events/${event.slug}`} icon={<MapPin className="h-4 w-4" />} title={event.title} text={`${event.city} · ${formatEventDate(event.dateStart)}`} />
            ))}
            {data.localCategories.slice(0, 3).map((category) => (
              <MiniRow key={category.id} href={`/local-services/create?category=${category.id}`} icon={<Wrench className="h-4 w-4" />} title={category.name} text="Verifizierte Anbieter in deiner Umgebung" />
            ))}
            {!data.events.length && !data.localCategories.length ? (
              <EmptyState text="Ergaenze deinen Standort, damit HotMess dir bessere lokale Empfehlungen zeigen kann." href="/profile/edit" cta="Profil bearbeiten" />
            ) : null}
          </div>
        </Section>

        <Section title="Neue verifizierte Mitglieder" href="/explore/people" cta="Alle ansehen">
          {data.people.length ? (
            <div className="grid gap-3">
              {data.people.slice(0, 4).map((person) => (
                <MiniRow key={person.id} href={`/u/${person.username}`} icon={<CheckCircle2 className="h-4 w-4" />} title={person.name} text={person.city ? `Verifiziert · ${person.city}` : "Verifiziertes Mitglied"} />
              ))}
            </div>
          ) : (
            <EmptyState text="Neue verifizierte Mitglieder erscheinen hier, sobald sie sichtbar sind." href="/explore/people" cta="Menschen finden" />
          )}
        </Section>
      </div>

      <Section title="Events, die zu dir passen" href="/events" cta="Alle Events">
        {data.events.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
                <p className="hm-label text-hm-goldDeep">{event.status === "sold_out" ? "Warteliste" : "Tickets"}</p>
                <h3 className="mt-3 text-lg font-black text-hm-ink">{event.title}</h3>
                <p className="mt-2 text-sm text-hm-inkSoft">{event.city} · {formatEventDate(event.dateStart)}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Event ansehen <ArrowRight className="h-4 w-4" /></div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="Noch keine passenden Events gefunden. Entdecke alle Events oder schau spaeter wieder vorbei." href="/events" cta="Events oeffnen" />
        )}
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Freunde Aktivitaeten" href="/friends" cta="Freunde ansehen">
          {data.friendActivity.length ? (
            <div className="grid gap-3">
              {data.friendActivity.map((item) => (
                <MiniRow key={item.id} href={item.eventId ? "/events" : `/u/${item.actor.username}`} icon={<UsersRound className="h-4 w-4" />} title={item.actor.name} text={`${item.activityType} · ${item.referenceLabel ?? "HotMess Aktivitaet"}`} />
              ))}
            </div>
          ) : (
            <EmptyState text="Sobald deine Kontakte aktiv werden, siehst du hier ihre Updates." href="/explore/people" cta="Kontakte finden" />
          )}
        </Section>

        <Section title="Business Chancen" href="/business" cta="Business oeffnen">
          {data.businessMe?.businessEnabled ? (
            <div className="grid gap-3">
              {data.businessSuggestions.slice(0, 3).map((item) => (
                <MiniRow key={item.userId} href="/business" icon={<Briefcase className="h-4 w-4" />} title={item.headline} text={item.matchReason} />
              ))}
              {data.jobs.slice(0, 2).map((job) => (
                <MiniRow key={job.id} href={`/business/jobs/${job.id}`} icon={<Briefcase className="h-4 w-4" />} title={job.title} text={`${job.company} · ${job.city ?? "Remote"}`} />
              ))}
              {!data.businessSuggestions.length && !data.jobs.length ? <EmptyState text="Neue Business-Kontakte, Jobs und Gruppen erscheinen hier." href="/business" cta="Vernetzen" /> : null}
            </div>
          ) : (
            <EmptyState text="Aktiviere dein Business-Profil, um relevante Kontakte, Jobs und Gruppen zu entdecken." href="/business" cta="Business aktivieren" />
          )}
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Dienstleistungen in deiner Naehe" href="/services" cta="Dienstleistungen">
          <div className="grid gap-3">
            {isProvider ? <MiniRow href="/local-services/company/dashboard" icon={<Wrench className="h-4 w-4" />} title="Anbieter-Dashboard" text={`${data.providerLeads.length} neue oder offene Leads`} /> : null}
            {data.localProjects.map((project) => (
              <MiniRow key={project.id} href={`/local-services/customer/projects/${project.id}/offers`} icon={<Wrench className="h-4 w-4" />} title={project.title} text={`${project.status} · ${project.category?.name ?? "Kategorie offen"}`} />
            ))}
            {data.localOrders.map((order) => (
              <MiniRow key={order.id} href={`/local-services/orders/${order.id}`} icon={<Ticket className="h-4 w-4" />} title="Laufende Dienstleistung" text={order.status} />
            ))}
            {data.localCategories.slice(0, 4).map((category) => (
              <MiniRow key={category.id} href={`/local-services/create?category=${category.id}`} icon={<Wrench className="h-4 w-4" />} title={category.name} text="Auftrag erstellen" />
            ))}
          </div>
        </Section>

        <Section title="Member Benefits" href="/benefits" cta="Benefits entdecken">
          <div className="grid gap-3">
            <MiniRow href="/benefits" icon={<Gift className="h-4 w-4" />} title="Hotel & Travel" text="Partnercodes und Wochenendvorteile vorbereitet" />
            <MiniRow href="/benefits" icon={<Gift className="h-4 w-4" />} title="VIP Vorteile" text="Exklusive Events, Deals und Member-Angebote" />
            <MiniRow href="/events" icon={<CalendarDays className="h-4 w-4" />} title="Event Benefits" text="Tickets, Wartelisten und Vorteile rund um Events" />
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section title="Trending Posts" href="/feed" cta="Feed ansehen">
          {data.posts.length ? (
            <div className="grid gap-3">
              {data.posts.map((post) => (
                <MiniRow key={post.id} href="/feed" icon={<MessageCircle className="h-4 w-4" />} title={post.author.name} text={`${post.likesCount} Likes · ${post.commentsCount} Kommentare · ${post.content ?? "Beitrag"}`} />
              ))}
            </div>
          ) : (
            <EmptyState text="Noch keine relevanten Beitraege. Folge Menschen oder erstelle den ersten HotMess Moment." href="/create" cta="Beitrag erstellen" />
          )}
        </Section>

        <Section title="Community Updates" href="/notifications" cta="Mitteilungen">
          <div className="grid gap-3">
            <MiniRow href="/verify" icon={<CheckCircle2 className="h-4 w-4" />} title="Verifizierung als Plattformregel" text="Nicht verifiziert bedeutet: nicht sichtbar und kein aktiver Zugang." />
            <MiniRow href="/services" icon={<Wrench className="h-4 w-4" />} title="Dienstleistungen erweitert" text="Kunden- und Anbieteransicht sind getrennt." />
            <MiniRow href="/benefits" icon={<Bell className="h-4 w-4" />} title="Benefits vorbereitet" text="Member-Vorteile werden als eigener Bereich aufgebaut." />
            <MiniRow href="/creator" icon={<Sparkles className="h-4 w-4" />} title="Creator aufgebaut" text="Verifizierte Experten, Coachings, Kurse und digitale Produkte werden sicher gebuendelt." />
            <MiniRow href="/digital-ai" icon={<Bot className="h-4 w-4" />} title="Digital & AI aufgebaut" text="Gepruefte digitale Loesungen, Automatisierungen und KI-Angebote werden sicher gebuendelt." />
            <MiniRow href="/trust" icon={<CheckCircle2 className="h-4 w-4" />} title="Trust-System vorbereitet" text="Vertrauen basiert auf echten Signalen, nicht auf Fake-Badges oder Social Credit." />
            <MiniRow href="/membership" icon={<Gift className="h-4 w-4" />} title="Membership vorbereitet" text="HotMess Plus buendelt Vorteile, Rollen und Premium-Signale ohne unfertige Zahlungen." />
          </div>
        </Section>
      </div>

      <Section title="Schnellaktionen" href="/profile" cta="Profil">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroButton href="/create" icon={<PlusCircle className="h-4 w-4" />} label="Beitrag erstellen" />
          <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Event entdecken" />
          <HeroButton href="/explore/people" icon={<UserRound className="h-4 w-4" />} label="Person finden" />
          <HeroButton href="/chat" icon={<MessageCircle className="h-4 w-4" />} label="Chat oeffnen" />
          <HeroButton href="/tickets" icon={<Ticket className="h-4 w-4" />} label="Ticket anzeigen" />
          <HeroButton href="/business" icon={<Briefcase className="h-4 w-4" />} label="Business oeffnen" />
          <HeroButton href="/local-services/create" icon={<Wrench className="h-4 w-4" />} label="Auftrag erstellen" />
          <HeroButton href="/digital-ai" icon={<Bot className="h-4 w-4" />} label="Digital & AI" />
          <HeroButton href="/membership" icon={<Gift className="h-4 w-4" />} label="Membership" />
          <HeroButton href="/profile/edit" icon={<UserRound className="h-4 w-4" />} label="Profil bearbeiten" />
          {isProvider ? <HeroButton href="/local-services/company/dashboard" icon={<Wrench className="h-4 w-4" />} label="Anbieter-Dashboard" /> : null}
          {isScanner ? <HeroButton href="/scanner" icon={<CheckCircle2 className="h-4 w-4" />} label="Scanner" /> : null}
          {isAdmin ? <HeroButton href="/admin" icon={<Sparkles className="h-4 w-4" />} label="Admin" /> : null}
        </div>
      </Section>
    </main>
  );
}

function Section({ title, href, cta, children }: { title: string; href: string; cta: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-hm-ink">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-goldDeep">
          {cta} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function HeroButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-pill border border-hm-gold/25 bg-hm-ivory px-5 py-3 text-sm font-bold text-hm-ink transition hover:border-hm-gold hover:bg-hm-champagne">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <ArrowRight className="h-4 w-4 text-hm-goldDeep" />
    </Link>
  );
}

function ActionCard({ href, icon, title, text, label }: { href: string; icon: React.ReactNode; title: string; text: string; label: string }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icon}</span>
        <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{label}</span>
      </div>
      <h3 className="mt-4 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </Link>
  );
}

function MiniRow({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-gold/60">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hm-porcelain text-hm-goldDeep">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-hm-ink">{title}</span>
        <span className="block truncate text-xs text-hm-inkSoft">{text}</span>
      </span>
    </Link>
  );
}

function EmptyState({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
      <p className="text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
        {cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StoryCreateCard() {
  return (
    <Link href="/create" className="w-28 shrink-0 rounded-card border border-hm-gold/25 bg-hm-champagne/50 p-3 shadow-luxury">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-hm-porcelain text-hm-goldDeep">
        <PlusCircle className="h-6 w-6" />
      </div>
      <p className="mt-3 text-xs font-bold text-hm-ink">Deine Story</p>
      <p className="mt-1 text-xs text-hm-inkSoft">Moment teilen</p>
    </Link>
  );
}
