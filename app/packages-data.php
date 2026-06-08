<?php

declare(strict_types=1);

function hotmess_packages(): array
{
    return [
        [
            'id' => 'pkg-basic-innsbruck-2026',
            'title' => 'HotMess Basic Weekend',
            'slug' => 'basic-weekend-innsbruck',
            'city' => 'Innsbruck',
            'startDate' => '2026-07-18',
            'endDate' => '2026-07-19',
            'packageType' => 'basic',
            'shortDescription' => 'Event access, app layer, city guide and selected partner benefits for a clean first HOTMESS weekend.',
            'longDescription' => 'The Basic Weekend turns a ticket into a guided HOTMESS experience. Guests receive event access, city notes, app-ready itinerary structure and curated partner benefits without committing to a full hotel package.',
            'heroImage' => '/assets/community-hero.png',
            'galleryImages' => ['/assets/community-hero.png', '/assets/waitlist.png', '/assets/packages.png'],
            'promoVideo' => '',
            'priceFrom' => 59,
            'availabilityStatus' => 'available',
            'includedItems' => [
                ['id' => 'basic-ticket', 'title' => 'Event Ticket', 'description' => 'Member-checked event access for one HOTMESS night.'],
                ['id' => 'basic-app', 'title' => 'App Zugang', 'description' => 'Prepared event save, reminders and arrival notes.'],
                ['id' => 'basic-guide', 'title' => 'City Guide', 'description' => 'Curated city notes and partner locations.'],
                ['id' => 'basic-benefits', 'title' => 'Partner Benefits', 'description' => 'Selected bar, shop or lifestyle advantages.'],
            ],
            'excludedItems' => ['Hotel stay', 'Private transfer', 'VIP table service', 'Flights or train tickets'],
            'itinerary' => [
                ['id' => 'basic-day1-arrival', 'packageId' => 'pkg-basic-innsbruck-2026', 'day' => 'Day 1', 'time' => '18:00', 'title' => 'City arrival', 'description' => 'Use the HOTMESS city guide and partner benefit list.', 'location' => 'Innsbruck center', 'relatedEventId' => null, 'relatedPartnerId' => 'bar-partner'],
                ['id' => 'basic-day1-event', 'packageId' => 'pkg-basic-innsbruck-2026', 'day' => 'Day 1', 'time' => '22:30', 'title' => 'HOTMESS event', 'description' => 'Guest list check and event access.', 'location' => 'Secret alpine residence', 'relatedEventId' => 'hm-innsbruck-2026', 'relatedPartnerId' => null],
            ],
            'eventIds' => ['hm-innsbruck-2026'],
            'hotelIds' => [],
            'partnerOfferIds' => ['bar-partner', 'fashion-partner'],
            'sponsorIds' => ['welcome-sponsor'],
            'membershipBenefits' => ['Passport members receive early allocation and app priority notes.'],
            'vipIncluded' => false,
            'shuttleIncluded' => false,
            'welcomeBagIncluded' => false,
            'conciergeIncluded' => false,
            'bookingUrl' => '/tickets?event=innsbruck-private-weekend',
            'inquiryEmail' => 'packages@hotmess-blkn.com',
            'faq' => [
                ['question' => 'Is a hotel included?', 'answer' => 'No. This package is for guests who want event access and guidance only.'],
                ['question' => 'Do I need membership?', 'answer' => 'Membership is recommended and may unlock earlier allocation.'],
            ],
            'partners' => hotmess_package_partner_placements(),
            'status' => 'published',
        ],
        [
            'id' => 'pkg-travel-vienna-2026',
            'title' => 'HotMess Travel Weekend',
            'slug' => 'travel-weekend-vienna',
            'city' => 'Vienna',
            'startDate' => '2026-08-08',
            'endDate' => '2026-08-10',
            'packageType' => 'travel',
            'shortDescription' => 'Event ticket, hotel advantage, shuttle notes, welcome benefit and partner locations.',
            'longDescription' => 'The Travel Weekend is built for guests arriving from another city. It combines event access with hotel direction, shuttle guidance, a welcome benefit and quiet partner privileges around the city.',
            'heroImage' => '/assets/waitlist.png',
            'galleryImages' => ['/assets/waitlist.png', '/assets/community-hero.png', '/assets/faq.png'],
            'promoVideo' => '',
            'priceFrom' => 189,
            'availabilityStatus' => 'few_left',
            'includedItems' => [
                ['id' => 'travel-ticket', 'title' => 'Event Ticket', 'description' => 'Access to the selected HOTMESS event.'],
                ['id' => 'travel-hotel', 'title' => 'Hotelkontingent', 'description' => 'Hotel benefit or room allocation request prepared.'],
                ['id' => 'travel-shuttle', 'title' => 'Shuttle Hinweise', 'description' => 'Arrival and local transfer guidance.'],
                ['id' => 'travel-welcome', 'title' => 'Welcome Benefit', 'description' => 'Selected arrival benefit with partner location.'],
            ],
            'excludedItems' => ['Flights', 'Private table minimum spend', 'Personal shopping'],
            'itinerary' => [
                ['id' => 'travel-day1-hotel', 'packageId' => 'pkg-travel-vienna-2026', 'day' => 'Day 1', 'time' => '16:00', 'title' => 'Hotel arrival', 'description' => 'Check in with hotel partner benefit.', 'location' => 'Partner hotel', 'relatedEventId' => null, 'relatedPartnerId' => 'hotel-partner'],
                ['id' => 'travel-day1-rooftop', 'packageId' => 'pkg-travel-vienna-2026', 'day' => 'Day 1', 'time' => '20:00', 'title' => 'Rooftop arrival', 'description' => 'HOTMESS event entry and hosted arrival.', 'location' => 'Private rooftop salon', 'relatedEventId' => 'hm-vienna-rooftop-2026', 'relatedPartnerId' => null],
                ['id' => 'travel-day2-brunch', 'packageId' => 'pkg-travel-vienna-2026', 'day' => 'Day 2', 'time' => '12:00', 'title' => 'Late checkout / city guide', 'description' => 'Use partner city guide and late checkout signal.', 'location' => 'Vienna center', 'relatedEventId' => null, 'relatedPartnerId' => 'restaurant-partner'],
            ],
            'eventIds' => ['hm-vienna-rooftop-2026'],
            'hotelIds' => ['late-checkout-partner'],
            'partnerOfferIds' => ['hotel-partner', 'restaurant-partner', 'shuttle-partner'],
            'sponsorIds' => ['welcome-sponsor'],
            'membershipBenefits' => ['Passport members receive hotel allocation priority and preferred arrival notes.'],
            'vipIncluded' => false,
            'shuttleIncluded' => true,
            'welcomeBagIncluded' => false,
            'conciergeIncluded' => false,
            'bookingUrl' => '',
            'inquiryEmail' => 'travel@hotmess-blkn.com',
            'faq' => [
                ['question' => 'Is the hotel guaranteed?', 'answer' => 'Hotel benefits and contingents are requested and confirmed after inquiry.'],
                ['question' => 'Is shuttle included?', 'answer' => 'Shuttle guidance is included; private transfers may be quoted separately.'],
            ],
            'partners' => hotmess_package_partner_placements(),
            'status' => 'published',
        ],
        [
            'id' => 'pkg-vip-innsbruck-2026',
            'title' => 'HotMess VIP Weekend',
            'slug' => 'vip-weekend-innsbruck',
            'city' => 'Innsbruck',
            'startDate' => '2026-07-18',
            'endDate' => '2026-07-20',
            'packageType' => 'vip',
            'shortDescription' => 'VIP ticket, fast lane, host hotel recommendation, table request and concierge contact.',
            'longDescription' => 'The VIP Weekend is for guests who want less friction and more hosted attention. It adds priority access, VIP area or table inquiry, concierge contact and exclusive partner benefits to the HOTMESS weekend.',
            'heroImage' => '/assets/packages.png',
            'galleryImages' => ['/assets/packages.png', '/assets/community-hero.png', '/assets/waitlist.png'],
            'promoVideo' => '',
            'priceFrom' => 420,
            'availabilityStatus' => 'request_only',
            'includedItems' => [
                ['id' => 'vip-ticket', 'title' => 'VIP Ticket', 'description' => 'VIP access layer for selected HOTMESS event.'],
                ['id' => 'vip-fastlane', 'title' => 'Fast Lane', 'description' => 'Priority arrival handling.'],
                ['id' => 'vip-table', 'title' => 'VIP Area / Table Anfrage', 'description' => 'Table or hosted area request prepared.'],
                ['id' => 'vip-concierge', 'title' => 'Concierge Kontakt', 'description' => 'Direct follow-up for final arrangement.'],
            ],
            'excludedItems' => ['Hotel room unless confirmed separately', 'Bottle minimum spend', 'International travel'],
            'itinerary' => [
                ['id' => 'vip-day1-concierge', 'packageId' => 'pkg-vip-innsbruck-2026', 'day' => 'Day 1', 'time' => '17:00', 'title' => 'Concierge confirmation', 'description' => 'Final arrival, hotel and VIP notes.', 'location' => 'Remote concierge', 'relatedEventId' => null, 'relatedPartnerId' => null],
                ['id' => 'vip-day1-event', 'packageId' => 'pkg-vip-innsbruck-2026', 'day' => 'Day 1', 'time' => '22:30', 'title' => 'VIP arrival', 'description' => 'Fast lane, host check and VIP request handling.', 'location' => 'Secret alpine residence', 'relatedEventId' => 'hm-innsbruck-2026', 'relatedPartnerId' => null],
            ],
            'eventIds' => ['hm-innsbruck-2026'],
            'hotelIds' => ['signature-city-stay'],
            'partnerOfferIds' => ['hotel-partner', 'wellness-partner', 'vip-sponsor'],
            'sponsorIds' => ['vip-sponsor'],
            'membershipBenefits' => ['Passport members receive first response on VIP table allocation.'],
            'vipIncluded' => true,
            'shuttleIncluded' => false,
            'welcomeBagIncluded' => false,
            'conciergeIncluded' => true,
            'bookingUrl' => '',
            'inquiryEmail' => 'vip@hotmess-blkn.com',
            'faq' => [
                ['question' => 'Is table service confirmed?', 'answer' => 'Table service is request-based and confirmed by the host team.'],
                ['question' => 'Can groups book?', 'answer' => 'Yes. Add guest count and VIP interest in the inquiry.'],
            ],
            'partners' => hotmess_package_partner_placements(),
            'status' => 'published',
        ],
        [
            'id' => 'pkg-signature-adriatic-2026',
            'title' => 'HotMess Signature Weekend',
            'slug' => 'signature-weekend-adriatic',
            'city' => 'Dubrovnik',
            'startDate' => '2026-09-12',
            'endDate' => '2026-09-14',
            'packageType' => 'signature',
            'shortDescription' => 'Premium hotel, VIP ticket, fast lane, welcome bag, transfer option, concierge and community brunch.',
            'longDescription' => 'The Signature Weekend is the most complete HOTMESS travel layer: premium hotel direction, VIP event access, fast lane, welcome bag, transfer option, concierge and a limited community brunch or dinner moment.',
            'heroImage' => '/assets/faq.png',
            'galleryImages' => ['/assets/faq.png', '/assets/packages.png', '/assets/community-hero.png'],
            'promoVideo' => '',
            'priceFrom' => 980,
            'availabilityStatus' => 'few_left',
            'includedItems' => [
                ['id' => 'signature-hotel', 'title' => 'Premium Hotel', 'description' => 'Premium hotel allocation request or confirmed partner option.'],
                ['id' => 'signature-vip', 'title' => 'VIP Ticket', 'description' => 'VIP event access with fast lane.'],
                ['id' => 'signature-bag', 'title' => 'Welcome Bag', 'description' => 'Partner-led premium welcome moment.'],
                ['id' => 'signature-dinner', 'title' => 'Community Dinner / Brunch', 'description' => 'Limited social moment for Signature guests.'],
            ],
            'excludedItems' => ['Flights', 'Personal expenses', 'Additional bottles outside package scope'],
            'itinerary' => [
                ['id' => 'signature-day1-arrival', 'packageId' => 'pkg-signature-adriatic-2026', 'day' => 'Day 1', 'time' => '15:00', 'title' => 'Premium arrival', 'description' => 'Hotel arrival, welcome bag and concierge check.', 'location' => 'Premium hotel', 'relatedEventId' => null, 'relatedPartnerId' => 'hotel-partner'],
                ['id' => 'signature-day1-dinner', 'packageId' => 'pkg-signature-adriatic-2026', 'day' => 'Day 1', 'time' => '20:30', 'title' => 'Community dinner', 'description' => 'Private dinner or brunch layer for Signature guests.', 'location' => 'Partner restaurant', 'relatedEventId' => null, 'relatedPartnerId' => 'restaurant-partner'],
                ['id' => 'signature-day2-event', 'packageId' => 'pkg-signature-adriatic-2026', 'day' => 'Day 2', 'time' => '23:30', 'title' => 'Adriatic Passport event', 'description' => 'VIP event access and host guidance.', 'location' => 'Coastal member house', 'relatedEventId' => 'hm-dubrovnik-2026', 'relatedPartnerId' => null],
            ],
            'eventIds' => ['hm-dubrovnik-2026'],
            'hotelIds' => ['private-arrival-suite'],
            'partnerOfferIds' => ['hotel-partner', 'restaurant-partner', 'shuttle-partner', 'wellness-partner', 'welcome-sponsor'],
            'sponsorIds' => ['welcome-sponsor', 'vip-sponsor'],
            'membershipBenefits' => ['Passport members receive limited Signature allocation priority and concierge pre-check.'],
            'vipIncluded' => true,
            'shuttleIncluded' => true,
            'welcomeBagIncluded' => true,
            'conciergeIncluded' => true,
            'bookingUrl' => '',
            'inquiryEmail' => 'signature@hotmess-blkn.com',
            'faq' => [
                ['question' => 'Is availability limited?', 'answer' => 'Yes. Signature allocation is intentionally limited.'],
                ['question' => 'Can partners upgrade placement?', 'answer' => 'Yes. Signature offers can include stronger event and app placement.'],
            ],
            'partners' => hotmess_package_partner_placements(),
            'status' => 'published',
        ],
    ];
}

function hotmess_package_partner_placements(): array
{
    return [
        [
            'partnerId' => 'hotel-partner',
            'name' => 'Hotelpartner',
            'partnerType' => 'Hotelpartner',
            'packageTypes' => ['travel', 'vip', 'signature'],
            'contribution' => 'Room allocation, late checkout or premium stay recommendation.',
            'visibility' => 'Hotel block, package card and detail page',
            'upgradeOptions' => ['Signature hero placement', 'App itinerary placement'],
            'clicks' => 168,
            'leads' => 24,
            'bookings' => 7,
        ],
        [
            'partnerId' => 'restaurant-partner',
            'name' => 'Restaurantpartner',
            'partnerType' => 'Restaurantpartner',
            'packageTypes' => ['travel', 'signature'],
            'contribution' => 'Community dinner, brunch or arrival benefit.',
            'visibility' => 'Itinerary placement and partner offer card',
            'upgradeOptions' => ['Community dinner sponsor', 'Concierge recommendation'],
            'clicks' => 94,
            'leads' => 13,
            'bookings' => 4,
        ],
        [
            'partnerId' => 'shuttle-partner',
            'name' => 'Shuttlepartner',
            'partnerType' => 'Shuttlepartner',
            'packageTypes' => ['travel', 'signature'],
            'contribution' => 'Arrival routes, shuttle guidance and transfer option.',
            'visibility' => 'Travel notes and package detail placement',
            'upgradeOptions' => ['Transfer CTA', 'App route placement'],
            'clicks' => 76,
            'leads' => 10,
            'bookings' => 3,
        ],
        [
            'partnerId' => 'welcome-sponsor',
            'name' => 'Welcome Bag Sponsor',
            'partnerType' => 'Welcome Bag Sponsor',
            'packageTypes' => ['basic', 'travel', 'signature'],
            'contribution' => 'Welcome product, premium sample or guest gift.',
            'visibility' => 'Welcome benefit and sponsor band',
            'upgradeOptions' => ['Signature bag lead partner', 'Gallery story placement'],
            'clicks' => 121,
            'leads' => 18,
            'bookings' => 5,
        ],
        [
            'partnerId' => 'vip-sponsor',
            'name' => 'VIP Sponsor',
            'partnerType' => 'VIP Sponsor',
            'packageTypes' => ['vip', 'signature'],
            'contribution' => 'VIP area benefit, hosted moment or table support.',
            'visibility' => 'VIP card, event detail and partner portal',
            'upgradeOptions' => ['VIP host moment', 'Sponsor row priority'],
            'clicks' => 138,
            'leads' => 21,
            'bookings' => 6,
        ],
    ];
}

function hotmess_package_by_slug(string $slug): ?array
{
    foreach (hotmess_packages() as $package) {
        if ($package['slug'] === $slug) {
            return $package;
        }
    }

    return null;
}

function hotmess_public_packages(): array
{
    return array_values(array_filter(
        hotmess_packages(),
        fn (array $package): bool => in_array($package['status'], ['published', 'draft'], true)
    ));
}

function hotmess_package_type_label(string $type): string
{
    return match ($type) {
        'basic' => 'Basic',
        'travel' => 'Travel',
        'vip' => 'VIP',
        'signature' => 'Signature',
        default => 'Package',
    };
}

function hotmess_package_availability_label(string $status): string
{
    return match ($status) {
        'few_left' => 'Few Left',
        'sold_out' => 'Sold Out',
        'request_only' => 'Request Only',
        default => 'Available',
    };
}
