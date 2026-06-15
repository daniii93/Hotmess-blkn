<?php

declare(strict_types=1);

function hotmess_events(): array
{
    return [
        [
            'id' => 'hm-innsbruck-2026',
            'title' => 'HOTMESS BLKN: Innsbruck Private Weekend',
            'slug' => 'innsbruck-private-weekend',
            'city' => 'Innsbruck',
            'venue' => 'Secret alpine residence',
            'address' => 'Announced to approved members 24h before doors',
            'startDate' => '2026-07-18',
            'endDate' => '2026-07-19',
            'doorsOpen' => '22:30',
            'category' => 'Signature Night',
            'shortDescription' => 'A curated alpine night for approved guests, passport members and selected partners.',
            'longDescription' => 'HOTMESS returns to Innsbruck with a private weekend chapter built around access, sound, hospitality and a room that feels deliberately selected. The experience is designed for guests who want more than entry: arrival, dresscode, hotel direction, VIP layers and a community that stays controlled.',
            'heroImage' => '/assets/community-hero.png',
            'galleryImages' => ['/assets/community-hero.png', '/assets/waitlist.png', '/assets/packages.png'],
            'promoVideo' => '',
            'dressCode' => 'Black, elevated, sensual. No sportswear.',
            'lineup' => ['Resident selectors', 'BLKN host table', 'Late-night guest set'],
            'hosts' => ['HOTMESS BLKN', 'Private host circle'],
            'timetable' => [
                ['time' => '22:30', 'title' => 'Private arrival', 'description' => 'Guest list check, welcome and first floor opening.'],
                ['time' => '00:00', 'title' => 'Main room', 'description' => 'Signature HOTMESS sound and hosted tables.'],
                ['time' => '02:30', 'title' => 'After dark', 'description' => 'Late set, partner moments and closed-room atmosphere.'],
            ],
            'ticketStatus' => 'few_tickets',
            'ticketProvider' => 'internal',
            'ticketUrl' => '/tickets?event=innsbruck-private-weekend',
            'tickets' => hotmess_ticket_types('innsbruck-private-weekend'),
            'vipAvailable' => true,
            'vipDescription' => 'Hosted table requests, priority access and concierge handling for selected groups.',
            'tableServiceAvailable' => true,
            'hotelIds' => ['signature-city-stay'],
            'packageIds' => ['weekend-suite'],
            'partnerIds' => ['hotel-partner'],
            'sponsorIds' => ['sponsor-partner'],
            'membershipAccess' => 'Passport Early Access',
            'appEnabled' => true,
            'safetyNotes' => ['Respect the room and the guest list.', 'No filming in private areas.', 'Speak to the host team for awareness support.'],
            'faq' => [
                ['question' => 'Do I need membership?', 'answer' => 'Ticket access opens first for approved members and Passport early access guests.'],
                ['question' => 'When is the location announced?', 'answer' => 'Approved guests receive final arrival notes before the event.'],
                ['question' => 'Are tables available?', 'answer' => 'Yes, table and bottle service requests are handled separately.'],
            ],
            'partners' => hotmess_event_partner_placements(),
            'status' => 'published',
            'priceFrom' => 29,
        ],
        [
            'id' => 'hm-vienna-rooftop-2026',
            'title' => 'HOTMESS Rooftop Arrival',
            'slug' => 'vienna-rooftop-arrival',
            'city' => 'Vienna',
            'venue' => 'Private rooftop salon',
            'address' => 'Vienna first district',
            'startDate' => '2026-08-08',
            'endDate' => '2026-08-09',
            'doorsOpen' => '20:00',
            'category' => 'Rooftop',
            'shortDescription' => 'Golden-hour arrival, private hosts and a softer luxury event rhythm.',
            'longDescription' => 'A fashion-led rooftop chapter created for early arrivals, hotel guests and partner-hosted groups.',
            'heroImage' => '/assets/waitlist.png',
            'galleryImages' => ['/assets/waitlist.png', '/assets/community-hero.png', '/assets/faq.png'],
            'promoVideo' => '',
            'dressCode' => 'Summer black, linen, silk, minimal gold.',
            'lineup' => ['Sunset selector', 'Private host set'],
            'hosts' => ['HOTMESS BLKN Vienna'],
            'timetable' => [
                ['time' => '20:00', 'title' => 'Arrival', 'description' => 'Rooftop check-in and first drinks.'],
                ['time' => '22:00', 'title' => 'Host hour', 'description' => 'Partner tables and curated introductions.'],
            ],
            'ticketStatus' => 'vip_available',
            'ticketProvider' => 'external_prepared',
            'ticketUrl' => '/tickets?event=vienna-rooftop-arrival',
            'tickets' => hotmess_ticket_types('vienna-rooftop-arrival'),
            'vipAvailable' => true,
            'vipDescription' => 'Rooftop table placement and private host welcome.',
            'tableServiceAvailable' => true,
            'hotelIds' => ['late-checkout-partner'],
            'packageIds' => ['partner-hosted'],
            'partnerIds' => ['travel-partner'],
            'sponsorIds' => ['sponsor-partner'],
            'membershipAccess' => 'Member priority',
            'appEnabled' => true,
            'safetyNotes' => ['Respect hotel and rooftop rules.', 'Private areas are not content zones.'],
            'faq' => [
                ['question' => 'Is there hotel access?', 'answer' => 'Partner hotel suggestions are prepared for this event.'],
                ['question' => 'Can partners host guests?', 'answer' => 'Yes, partner-hosted visibility is prepared.'],
            ],
            'partners' => hotmess_event_partner_placements(),
            'status' => 'published',
            'priceFrom' => 45,
        ],
        [
            'id' => 'hm-dubrovnik-2026',
            'title' => 'HOTMESS Adriatic Passport',
            'slug' => 'adriatic-passport-weekend',
            'city' => 'Dubrovnik',
            'venue' => 'Coastal member house',
            'address' => 'Partner venue, coastal zone',
            'startDate' => '2026-09-12',
            'endDate' => '2026-09-13',
            'doorsOpen' => '21:00',
            'category' => 'Travel Weekend',
            'shortDescription' => 'A destination concept for Passport members, hotels and travel partners.',
            'longDescription' => 'A future-facing HOTMESS travel weekend prepared for hotel inventory, package sales and app-led itinerary saving.',
            'heroImage' => '/assets/packages.png',
            'galleryImages' => ['/assets/packages.png', '/assets/community-hero.png', '/assets/waitlist.png'],
            'promoVideo' => '',
            'dressCode' => 'Resort black, elevated eveningwear.',
            'lineup' => ['Coastal resident', 'Guest host'],
            'hosts' => ['HOTMESS Travel Circle'],
            'timetable' => [
                ['time' => '21:00', 'title' => 'Member dinner option', 'description' => 'Package layer prepared for selected guests.'],
                ['time' => '23:30', 'title' => 'Main event', 'description' => 'Private club room and partner-hosted tables.'],
            ],
            'ticketStatus' => 'passport_early_access',
            'ticketProvider' => 'external_prepared',
            'ticketUrl' => '/tickets?event=adriatic-passport-weekend',
            'tickets' => hotmess_ticket_types('adriatic-passport-weekend'),
            'vipAvailable' => false,
            'vipDescription' => 'VIP will open after hotel and package allocation.',
            'tableServiceAvailable' => false,
            'hotelIds' => ['private-arrival-suite'],
            'packageIds' => ['member-escape'],
            'partnerIds' => ['hotel-partner', 'travel-partner'],
            'sponsorIds' => [],
            'membershipAccess' => 'Passport only until public release',
            'appEnabled' => true,
            'safetyNotes' => ['Travel itinerary guidance follows membership approval.', 'Partner hotels may require separate confirmation.'],
            'faq' => [
                ['question' => 'Is this public?', 'answer' => 'Passport early access opens before any public release.'],
                ['question' => 'Are packages required?', 'answer' => 'No, but hotel and travel packages will be recommended.'],
            ],
            'partners' => hotmess_event_partner_placements(),
            'status' => 'draft',
            'priceFrom' => 89,
        ],
        [
            'id' => 'hm-milan-2026',
            'title' => 'HOTMESS Fashion After Dark',
            'slug' => 'milan-fashion-after-dark',
            'city' => 'Milan',
            'venue' => 'Member-only atelier room',
            'address' => 'Milan, invitation address',
            'startDate' => '2026-10-03',
            'endDate' => '2026-10-04',
            'doorsOpen' => '23:00',
            'category' => 'Fashion Week',
            'shortDescription' => 'A campaign-style late event for fashion, music and members.',
            'longDescription' => 'A reserved international chapter for brand partners, sponsor visibility and a guest list that stays intentionally small.',
            'heroImage' => '/assets/faq.png',
            'galleryImages' => ['/assets/faq.png', '/assets/packages.png', '/assets/waitlist.png'],
            'promoVideo' => '',
            'dressCode' => 'Black tailoring, editorial eveningwear.',
            'lineup' => ['Fashion week host', 'Late selector'],
            'hosts' => ['HOTMESS BLKN', 'Sponsor host'],
            'timetable' => [
                ['time' => '23:00', 'title' => 'Atelier arrival', 'description' => 'Guest list, sponsor check-in and first room.'],
                ['time' => '01:00', 'title' => 'After dark', 'description' => 'Main floor opens for approved guests.'],
            ],
            'ticketStatus' => 'sold_out',
            'ticketProvider' => 'external_prepared',
            'ticketUrl' => '/tickets?event=milan-fashion-after-dark',
            'tickets' => hotmess_ticket_types('milan-fashion-after-dark'),
            'vipAvailable' => false,
            'vipDescription' => 'Closed allocation.',
            'tableServiceAvailable' => false,
            'hotelIds' => [],
            'packageIds' => [],
            'partnerIds' => ['sponsor-partner'],
            'sponsorIds' => ['sponsor-partner'],
            'membershipAccess' => 'Closed member allocation',
            'appEnabled' => false,
            'safetyNotes' => ['Closed event. No resale.', 'Invitation transfer is not allowed.'],
            'faq' => [
                ['question' => 'Can I still join?', 'answer' => 'This event is currently sold out. Join membership for waitlist signals.'],
            ],
            'partners' => hotmess_event_partner_placements(),
            'status' => 'sold_out',
            'priceFrom' => 120,
        ],
    ];
}

function hotmess_ticket_types(string $eventSlug): array
{
    return [
        [
            'id' => $eventSlug . '-early',
            'title' => 'Early Bird',
            'priceFrom' => 29,
            'benefits' => ['Event entry', 'Member verification', 'App save prepared'],
            'availability' => 'Few Tickets',
            'requiresMembership' => true,
            'status' => 'few_tickets',
            'ctaLabel' => 'Request early access',
            'externalUrl' => '',
        ],
        [
            'id' => $eventSlug . '-regular',
            'title' => 'Regular',
            'priceFrom' => 45,
            'benefits' => ['Event entry', 'Guest list check', 'Partner offers prepared'],
            'availability' => 'Available',
            'requiresMembership' => false,
            'status' => 'available',
            'ctaLabel' => 'Select ticket',
            'externalUrl' => '',
        ],
        [
            'id' => $eventSlug . '-vip',
            'title' => 'VIP',
            'priceFrom' => 180,
            'benefits' => ['Priority access', 'Hosted table request', 'Concierge follow-up'],
            'availability' => 'VIP Available',
            'requiresMembership' => true,
            'status' => 'vip_available',
            'ctaLabel' => 'Request VIP',
            'externalUrl' => '',
        ],
        [
            'id' => $eventSlug . '-table',
            'title' => 'Table / Bottle Service',
            'priceFrom' => 420,
            'benefits' => ['Table request', 'Bottle service inquiry', 'Host contact'],
            'availability' => 'By request',
            'requiresMembership' => true,
            'status' => 'request',
            'ctaLabel' => 'Request table',
            'externalUrl' => '',
        ],
        [
            'id' => $eventSlug . '-passport',
            'title' => 'Passport Member Access',
            'priceFrom' => 0,
            'benefits' => ['Early allocation', 'Travel notes', 'Package priority'],
            'availability' => 'Passport Early Access',
            'requiresMembership' => true,
            'status' => 'passport_early_access',
            'ctaLabel' => 'Join membership',
            'externalUrl' => '/membership',
        ],
    ];
}

function hotmess_event_partner_placements(): array
{
    return [
        [
            'partnerId' => 'hotel-partner',
            'eventId' => 'hm-innsbruck-2026',
            'name' => 'Signature Hotel Partner',
            'benefits' => 'Late checkout, room shortlist and arrival support.',
            'visibility' => 'Hotel block and event detail placement',
            'logoPlacement' => 'Partner row',
            'eventPagePlacement' => 'Hotel CTA section',
            'appPlacement' => 'Saved event offer',
            'discountCode' => 'HOTMESSSTAY',
            'clicks' => 128,
            'leads' => 18,
        ],
        [
            'partnerId' => 'sponsor-partner',
            'eventId' => 'hm-innsbruck-2026',
            'name' => 'Premium Sponsor Partner',
            'benefits' => 'Hosted moment, subtle brand placement and guest offer.',
            'visibility' => 'Sponsor strip and VIP card',
            'logoPlacement' => 'Event sponsor band',
            'eventPagePlacement' => 'Partner and sponsor section',
            'appPlacement' => 'App event detail',
            'discountCode' => 'BLKNPRIVATE',
            'clicks' => 92,
            'leads' => 11,
        ],
    ];
}

function hotmess_event_by_slug(string $slug): ?array
{
    foreach (hotmess_events() as $event) {
        if ($event['slug'] === $slug) {
            return $event;
        }
    }

    return null;
}

function hotmess_public_events(): array
{
    return array_values(array_filter(
        hotmess_events(),
        fn (array $event): bool => in_array($event['status'], ['published', 'sold_out', 'draft'], true)
    ));
}

function hotmess_next_event(): ?array
{
    $events = array_values(array_filter(
        hotmess_public_events(),
        fn (array $event): bool => $event['status'] !== 'sold_out'
    ));

    usort($events, fn (array $a, array $b): int => strcmp($a['startDate'], $b['startDate']));

    return $events[0] ?? null;
}

function hotmess_ticket_status_label(string $status): string
{
    return match ($status) {
        'sold_out' => 'Sold Out',
        'few_tickets' => 'Few Tickets',
        'vip_available' => 'VIP Available',
        'passport_early_access' => 'Passport Early Access',
        'request' => 'By Request',
        default => 'Available',
    };
}
