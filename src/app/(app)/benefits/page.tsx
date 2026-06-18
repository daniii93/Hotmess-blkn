import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Dumbbell,
  Gift,
  Hotel,
  MapPin,
  Martini,
  ShieldCheck,
  Sparkles,
  TicketPercent,
  Utensils,
  Wrench,
} from "lucide-react";
import { getBenefitsData } from "@/features/benefits/service";
import { formatEventDate, formatMoney } from "@/features/events/format";

export const dynamic = "force-dynamic";

export default async function BenefitsPage() {
  const data = await getBenefitsData();
  const firstName = data.profile?.first_name ?? data.profile?.username ?? "HotMess";
  const providerVerified = data.localMe?.providerProfile?.verificationStatus === "verified";
  const businessVerified = Boolean(data.businessMe?.verified);

  const overview = [
    {
      title: "Restaurants",
      text: "Date-Spots, Business Lunches, Welcome Drinks und Eventnahe Treffpunkte.",
      href: "#restaurants",
      icon: <Utensils className="h-5 w-5" />,
      state: "Vorbereitet",
    },
    {
      title: "Hotels",
      text: data.hotelBenefits.length
        ? `${data.hotelBenefits.length} aktive Partnerhotels oder Hotelvorteile gefunden.`
        : "Hotelcodes, Event-Packages, Late Check-out und Wochenendvorteile.",
      href: "#hotels",
      icon: <Hotel className="h-5 w-5" />,
      state: data.hotelBenefits.length ? "Aktiv" : "Vorbereitet",
    },
    {
      title: "Fitness & Lifestyle",
      text: "Fitness, Wellness, Barber, Beauty, Health und lokale Membership-Partner.",
      href: "#fitness",
      icon: <Dumbbell className="h-5 w-5" />,
      state: "Vorbereitet",
    },
    {
      title: "Member Deals",
      text: data.discounts.length
        ? `${data.discounts.length} echte aktive Code- oder Eventvorteile im System.`
        : "Zeitlich begrenzte Vorteile mit klaren Bedingungen.",
      href: "#deals",
      icon: <TicketPercent className="h-5 w-5" />,
      state: data.discounts.length ? "Aktiv" : "Keine aktiven Deals",
    },
    {
      title: "VIP Vorteile",
      text: "Fast Lane, Tische, Drink Packages, Birthday Packages und Member-only Zugang.",
      href: "#vip",
      icon: <Sparkles className="h-5 w-5" />,
      state: data.counts.tableBookings || data.counts.addonBookings ? "Aktiv" : "Eventbasiert",
    },
    {
      title: "Dienstleistungen",
      text: data.counts.verifiedProviders
        ? `${data.counts.verifiedProviders} verifizierte Anbieter koennen Benefits tragen.`
        : "Partnerkonditionen bei geprueften lokalen Anbietern.",
      href: "#services",
      icon: <Wrench className="h-5 w-5" />,
      state: data.counts.verifiedProviders ? "Aktiv" : "Vorbereitet",
    },
  ];

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-28 pt-8 sm:px-6 lg:px-10">
      <section className="overflow-hidden rounded-[2rem] border border-hm-gold/25 bg-hm-porcelain p-6 shadow-luxury md:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="hm-label text-hm-goldDeep">Membership Benefits</p>
            <h1 className="hm-display mt-3 text-4xl text-hm-ink sm:text-6xl">
              Nutze echte Vorteile als HotMess-Mitglied.
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-hm-inkSoft sm:text-base">
              Hallo {firstName}. Benefits buendelt Partnerangebote, Restaurant-Ideen, Hotelvorteile,
              VIP-Zugaenge, exklusive Events, Business-Vorteile und Dienstleister-Benefits. Keine
              Fake-Deals, keine kuenstliche Knappheit, nur echte hinterlegte Vorteile oder klare Vorbereitung.
            </p>
            {!data.verified ? (
              <div className="mt-5 rounded-card border border-hm-gold/30 bg-hm-champagne p-4">
                <p className="text-sm font-black text-hm-ink">Verifizierung erforderlich</p>
                <p className="mt-2 text-sm leading-6 text-hm-inkSoft">
                  Verifiziere dein Profil, um HotMess Benefits aktiv nutzen zu koennen.
                </p>
                <Link href="/verify" className="mt-4 inline-flex items-center gap-2 rounded-pill bg-hm-ink px-5 py-3 text-sm font-bold text-white">
                  Profil verifizieren <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <HeroButton href="#overview" icon={<Gift className="h-4 w-4" />} label="Vorteile entdecken" />
            <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Events mit Vorteilen" />
            <HeroButton href="#hotels" icon={<Hotel className="h-4 w-4" />} label="Hotelvorteile ansehen" />
            <HeroButton href="/partner" icon={<Briefcase className="h-4 w-4" />} label="Partner werden" />
          </div>
        </div>
      </section>

      <section id="overview" className="grid gap-4 md:grid-cols-3">
        {overview.map((item) => (
          <OverviewCard key={item.title} {...item} />
        ))}
      </section>

      <div className="grid gap-7 lg:grid-cols-[0.58fr_0.42fr]">
        <Section id="restaurants" title="Restaurants" cta="Eventnahe Orte" href="/events">
          <EmptyState
            title="Restaurant-Benefits werden vorbereitet."
            text="Bald findest du hier Vorteile fuer Dates, Business Lunches, Gruppenreservierungen und After-Event Treffen. Bis echte Partnerangebote hinterlegt sind, zeigen wir keine erfundenen Deals."
            action="Events ansehen"
            href="/events"
          />
          <div className="mt-4 grid gap-3">
            <SignalRow icon={<MapPin className="h-4 w-4" />} title="Verbindung zu Connect" text="Benefits schafft reale Orte fuer Treffen, ohne private Dating- oder Chatdaten offenzulegen." />
            <SignalRow icon={<Briefcase className="h-4 w-4" />} title="Business Lunch vorbereitet" text="Business-Nutzer koennen spaeter Meeting- und Lunch-Vorteile nutzen." />
          </div>
        </Section>

        <Section id="hotels" title="Hotels & Aufenthalte" cta="Events oeffnen" href="/events">
          {data.hotelBenefits.length ? (
            <div className="grid gap-3">
              {data.hotelBenefits.map((hotel) => (
                <SignalRow
                  key={hotel.id}
                  icon={<Hotel className="h-4 w-4" />}
                  title={hotel.name}
                  text={`${hotel.city} - Partnerhotel aktiv. Buchung bleibt beim Hotel, HotMess zeigt nur den Vorteil.`}
                  href={hotel.externalUrl ?? undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Hotelvorteile werden vorbereitet."
              text="Sobald Partnerhotels aktiv sind, findest du hier Codes, Event-Packages, Late Check-out oder Business-Tarife."
              action="Events ansehen"
              href="/events"
            />
          )}
          {data.myBenefits.some((benefit) => benefit.title.includes("Hotelcode")) ? (
            <p className="mt-4 rounded-xl bg-hm-champagne px-4 py-3 text-sm font-bold text-hm-ink">
              In deinen Vorteilen liegt bereits mindestens ein Hotelcode.
            </p>
          ) : null}
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-3">
        <Section id="fitness" title="Fitness & Lifestyle" cta="Partner werden" href="/partner">
          <EmptyState
            title="Lifestyle-Partner werden kuratiert."
            text="Fitness, Wellness, Barber, Beauty und lokale Membership-Partner werden als Kategorie vorbereitet. HotMess baut kein separates Fitnessportal."
            action="Partnerprogramm"
            href="/partner"
          />
        </Section>

        <Section id="travel" title="Reisen & Event Trips" cta="Hotelvorteile" href="#hotels">
          <div className="grid gap-3">
            {data.upcomingEvents.slice(0, 3).map((event) => (
              <SignalRow
                key={event.id}
                icon={<CalendarDays className="h-4 w-4" />}
                title={event.title}
                text={`${event.city} - ${formatEventDate(event.dateStart)}. Event bleibt der Anlass, Benefits der Vorteil rundherum.`}
                href={`/events/${event.slug}`}
              />
            ))}
            {!data.upcomingEvents.length ? (
              <EmptyState title="Noch keine Event-Trips aktiv." text="Event-Wochenenden und Partneraufenthalte erscheinen hier, sobald echte Events oder Hotelvorteile vorhanden sind." action="Events ansehen" href="/events" />
            ) : null}
          </div>
        </Section>

        <Section id="reservations" title="Reservierungen" cta="Tickets" href="/tickets">
          <div className="grid gap-3">
            <Metric label="Tischbuchungen" value={data.counts.tableBookings} />
            <Metric label="Add-on Buchungen" value={data.counts.addonBookings} />
            <p className="text-sm leading-6 text-hm-inkSoft">
              Reservierungen werden nur verlinkt, wenn echte Tabellen, Pakete oder Hotelcodes existieren. Keine unfertige Reservierungsengine wird als live verkauft.
            </p>
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section id="deals" title="Member Deals" cta="Events" href="/events">
          {data.discounts.length ? (
            <div className="grid gap-3">
              {data.discounts.slice(0, 5).map((deal) => (
                <SignalRow
                  key={deal.id}
                  icon={<TicketPercent className="h-4 w-4" />}
                  title="Aktiver Event- oder Member-Vorteil"
                  text={deal.expiresAt ? `Gueltig bis ${new Intl.DateTimeFormat("de-DE").format(new Date(deal.expiresAt))}. Bedingungen im Checkout.` : "Ohne Ablaufdatum hinterlegt. Bedingungen im Checkout."}
                  href={deal.eventId ? "/events" : undefined}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="Aktuell gibt es keine aktiven Member Deals." text="Deals erscheinen hier nur, wenn echte Codes oder Partnerangebote aktiv und nicht abgelaufen sind." action="Events ansehen" href="/events" />
          )}
        </Section>

        <Section id="vip" title="VIP Vorteile" cta="Events ansehen" href="/events">
          {data.eventBenefits.length ? (
            <div className="grid gap-3">
              {data.eventBenefits.map((event) => (
                <SignalRow
                  key={event.id}
                  icon={<Martini className="h-4 w-4" />}
                  title={event.title}
                  text={`${event.tables} Tische, ${event.drinkPackages} Drink Packages, ${event.birthdayPackages} Birthday Packages`}
                  href={`/events/${event.slug}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="VIP-Vorteile werden eventbasiert sichtbar." text="Fast Lane, Tische, Drink Packages und Birthday Packages erscheinen erst, wenn passende Events diese echten Add-ons hinterlegt haben." action="Events oeffnen" href="/events" />
          )}
        </Section>
      </div>

      <Section id="events" title="Exklusive Events & Event Benefits" cta="Alle Events" href="/events">
        <div className="grid gap-4 md:grid-cols-2">
          {data.upcomingEvents.slice(0, 4).map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="rounded-card border border-hm-border bg-hm-ivory p-4 transition hover:border-hm-gold/60">
              <p className="hm-label text-hm-goldDeep">{event.status === "sold_out" ? "Warteliste" : "Event Benefit"}</p>
              <h3 className="mt-3 text-sm font-black text-hm-ink">{event.title}</h3>
              <p className="mt-2 text-xs leading-5 text-hm-inkSoft">{event.city} - {formatEventDate(event.dateStart)}</p>
              <p className="mt-3 text-xs text-hm-inkSoft">
                Tickets ab {event.ticketTypes[0] ? formatMoney(event.ticketTypes[0].priceCents, event.ticketTypes[0].currency) : "offen"}.
                {event.tables.length ? ` ${event.tables.length} Tischoptionen.` : ""}
              </p>
            </Link>
          ))}
          {!data.upcomingEvents.length ? (
            <EmptyState title="Noch keine exklusiven Events sichtbar." text="Member-only oder VIP-Events erscheinen hier, sobald sie als echte Events hinterlegt sind." action="Events ansehen" href="/events" />
          ) : null}
        </div>
      </Section>

      <div className="grid gap-7 lg:grid-cols-2">
        <Section id="business" title="Business Benefits" cta="Business Hub" href="/business">
          <div className="grid gap-3">
            <SignalRow icon={<Briefcase className="h-4 w-4" />} title={businessVerified ? "Business-Profil verifiziert" : "Business-Vorteile vorbereitet"} text={businessVerified ? "Business Lunch, Hotels, Events und Partnerangebote koennen gezielt genutzt werden." : "Aktiviere und verifiziere Business, um spaeter Business-Vorteile klar getrennt zu nutzen."} href="/business" />
            <SignalRow icon={<Hotel className="h-4 w-4" />} title="Hotel Business-Tarife" text="Wird aus Partnerhotels und Hotelcodes abgeleitet, ohne ein eigenes Reiseportal zu bauen." href="#hotels" />
          </div>
        </Section>

        <Section id="services" title="Dienstleistungen Benefits" cta="Dienstleistungen" href="/local-services">
          <div className="grid gap-3">
            <SignalRow icon={<Wrench className="h-4 w-4" />} title={providerVerified ? "Anbieterprofil aktiv" : "Member-Vorteile bei Dienstleistern"} text={providerVerified ? "Dein Anbieterprofil kann spaeter echte Member Deals tragen." : "Gepruefte Anbieter, kostenlose Erstberatung oder Partnerkonditionen werden hier sichtbar, sobald echte Angebote hinterlegt sind."} href={providerVerified ? "/local-services/company/dashboard" : "/local-services"} />
            {data.localCategories.slice(0, 3).map((category) => (
              <SignalRow key={category.id} icon={<Wrench className="h-4 w-4" />} title={category.name} text="Kategorie fuer gepruefte lokale Anbieter." href={`/local-services/create?category=${category.id}`} />
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-7 lg:grid-cols-[0.45fr_0.55fr]">
        <Section id="partner" title="Partner werden" cta="Partnerprogramm" href="/partner">
          <p className="text-sm leading-6 text-hm-inkSoft">
            HotMess bringt Partner mit verifizierten Mitgliedern, Events, Business, Connect und Dienstleistungen zusammen. Partnerangebote muessen klar, echt und nachvollziehbar sein.
          </p>
          <div className="mt-4 grid gap-3">
            <HeroButton href="/partner" icon={<Gift className="h-4 w-4" />} label="Partnerprogramm ansehen" />
            {data.isAdmin ? <HeroButton href="/admin/partners" icon={<ShieldCheck className="h-4 w-4" />} label="Partner verwalten" /> : null}
            {data.isAdmin ? <HeroButton href="/admin/partners-program" icon={<ShieldCheck className="h-4 w-4" />} label="Partnerprogramm Admin" /> : null}
          </div>
        </Section>

        <Section id="my-benefits" title="Meine Vorteile" cta="Meine Tickets" href="/tickets">
          {data.myBenefits.length ? (
            <div className="grid gap-3">
              {data.myBenefits.map((benefit, index) => (
                <SignalRow key={`${benefit.title}-${index}`} icon={<BadgeCheck className="h-4 w-4" />} title={benefit.title} text={benefit.text} href={benefit.href} />
              ))}
            </div>
          ) : (
            <EmptyState title="Noch keine eingelosten Vorteile." text="Deine genutzten Vorteile werden hier angezeigt, sobald Tickets, Hotelcodes oder echte Benefit-Einloesungen vorhanden sind." action="Tickets ansehen" href="/tickets" />
          )}
        </Section>
      </div>

      <Section id="trust" title="Trust & Transparenz" cta="Discover" href="/discover">
        <div className="grid gap-4 md:grid-cols-3">
          <TrustCard title="Keine Fake-Deals" text="Benefits zeigt nur hinterlegte Partnerangebote, Eventvorteile oder klare Vorbereitung." />
          <TrustCard title="Klare Bedingungen" text="Gueltigkeit, Verifizierung, Partnerstatus und Einloesung werden sichtbar gemacht, sobald Daten vorhanden sind." />
          <TrustCard title="Datenschutz" text="Keine privaten Buchungs-, Ticket-, Dating-, Chat- oder Partnerdaten werden oeffentlich angezeigt." />
        </div>
      </Section>

      <Section id="quick-actions" title="Schnellaktionen" cta="Profil" href="/profile">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <HeroButton href="/benefits" icon={<Gift className="h-4 w-4" />} label="Vorteile entdecken" />
          <HeroButton href="/events" icon={<CalendarDays className="h-4 w-4" />} label="Events mit Vorteilen" />
          <HeroButton href="/business" icon={<Briefcase className="h-4 w-4" />} label="Business Vorteile" />
          <HeroButton href="/local-services" icon={<Wrench className="h-4 w-4" />} label="Dienstleister Vorteile" />
          <HeroButton href="/tickets" icon={<TicketPercent className="h-4 w-4" />} label="Meine Tickets" />
          <HeroButton href="/partner" icon={<Gift className="h-4 w-4" />} label="Partner werden" />
          <HeroButton href={data.verified ? "/profile" : "/verify"} icon={<BadgeCheck className="h-4 w-4" />} label={data.verified ? "Profil ansehen" : "Profil verifizieren"} />
          {data.isAdmin ? <HeroButton href="/admin/partners" icon={<ShieldCheck className="h-4 w-4" />} label="Admin Partner" /> : null}
        </div>
      </Section>
    </main>
  );
}

function Section({ id, title, href, cta, children }: { id: string; title: string; href: string; cta: string; children: ReactNode }) {
  return (
    <section id={id} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury scroll-mt-24">
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

function HeroButton({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Link href={href} className="inline-flex items-center justify-between gap-3 rounded-pill border border-hm-gold/25 bg-hm-ivory px-5 py-3 text-sm font-bold text-hm-ink transition hover:border-hm-gold hover:bg-hm-champagne">
      <span className="inline-flex items-center gap-2">{icon}{label}</span>
      <ArrowRight className="h-4 w-4 text-hm-goldDeep" />
    </Link>
  );
}

function OverviewCard({ href, icon, title, text, state }: { href: string; icon: ReactNode; title: string; text: string; state: string }) {
  return (
    <Link href={href} className="rounded-card border border-hm-border bg-hm-porcelain p-5 shadow-luxury transition hover:border-hm-gold/60">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-hm-gold/10 text-hm-goldDeep">{icon}</span>
        <span className="rounded-full bg-hm-champagne px-3 py-1 text-[11px] font-bold text-hm-inkSoft">{state}</span>
      </div>
      <h2 className="mt-4 text-lg font-black text-hm-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">Ansehen <ArrowRight className="h-4 w-4" /></span>
    </Link>
  );
}

function SignalRow({ href, icon, title, text }: { href?: string; icon: ReactNode; title: string; text: string }) {
  const content = (
    <>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-hm-porcelain text-hm-goldDeep">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-hm-ink">{title}</span>
        <span className="block text-xs leading-5 text-hm-inkSoft">{text}</span>
      </span>
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">{content}</div>;
  }

  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-hm-border bg-hm-ivory px-4 py-3 transition hover:border-hm-gold/60">
      {content}
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-hm-border bg-hm-ivory px-4 py-3">
      <p className="font-display text-3xl text-hm-ink">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-hm-inkSoft">{label}</p>
    </div>
  );
}

function EmptyState({ title, text, action, href }: { title: string; text: string; action: string; href: string }) {
  return (
    <div className="rounded-xl border border-dashed border-hm-gold/35 bg-hm-ivory px-4 py-5">
      <p className="text-sm font-black text-hm-ink">{title}</p>
      <p className="mt-2 text-sm leading-6 text-hm-inkSoft">{text}</p>
      <Link href={href} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-hm-goldDeep">
        {action} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function TrustCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-card border border-hm-gold/20 bg-hm-ivory p-4">
      <ShieldCheck className="h-5 w-5 text-hm-goldDeep" />
      <h3 className="mt-3 text-sm font-black text-hm-ink">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-hm-inkSoft">{text}</p>
    </div>
  );
}
