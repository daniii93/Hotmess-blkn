<?php

declare(strict_types=1);

function hotmess_app_features(): array
{
    return [
        ['id' => 'ticket-wallet', 'title' => 'Ticket Wallet', 'slug' => 'tickets', 'description' => 'Tickets, QR-Code Platzhalter and entry notes in one member-first wallet.', 'icon' => 'Wallet', 'category' => 'tickets', 'status' => 'active'],
        ['id' => 'event-favorites', 'title' => 'Event Favoriten', 'slug' => 'events', 'description' => 'Events speichern, Erinnerungen vorbereiten und mit dem Passport Zugang verbinden.', 'icon' => 'Calendar', 'category' => 'Events', 'status' => 'active'],
        ['id' => 'hotel-info', 'title' => 'Hotelinfos', 'slug' => 'hotels', 'description' => 'Notizen zu Partnerhotels, Late-Checkout-Signale und Orientierung für den Aufenthalt.', 'icon' => 'Hotel', 'category' => 'Hotels', 'status' => 'active'],
        ['id' => 'package-overview', 'title' => 'Weekend Übersicht', 'slug' => 'packages', 'description' => 'HOTMESS Weekends, Tagespläne, VIP-Ebenen und Reisehinweise an einem Ort.', 'icon' => 'Luggage', 'category' => 'Weekends', 'status' => 'active'],
        ['id' => 'city-map', 'title' => 'City Guide Karte', 'slug' => 'map', 'description' => 'Partnerorte, Shuttle-Hinweise, Safety Notes und kuratierte Wege durch die Stadt.', 'icon' => 'Map', 'category' => 'Karte', 'status' => 'active'],
        ['id' => 'partner-offers', 'title' => 'Partnerangebote', 'slug' => 'offers', 'description' => 'Gespeicherte Vorteile, Rabattcodes und Partnerkarten nach Stadt und Passport-Stufe.', 'icon' => 'Tag', 'category' => 'Vorteile', 'status' => 'active'],
        ['id' => 'member-profile', 'title' => 'Digitale Member Card', 'slug' => 'profile', 'description' => 'Passport Card, gespeicherte Vorteile, Profilstatus und Verlängerungsplatzhalter.', 'icon' => 'User', 'category' => 'Profil', 'status' => 'active'],
        ['id' => 'push-ready', 'title' => 'Push Notification Vorbereitung', 'slug' => 'notifications', 'description' => 'Admin-ready push messages for event reminders, safety and city updates.', 'icon' => 'Bell', 'category' => 'notifications', 'status' => 'draft'],
    ];
}

function hotmess_app_offers(): array
{
    return [
        ['id' => 'offer-hotel-late', 'title' => 'Late Checkout Signal', 'partnerId' => 'hotel-partner', 'city' => 'Vienna', 'description' => 'Hotel benefit placeholder for Plus and Black members.', 'code' => 'HOTMESSSTAY', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'tierRequired' => 'plus', 'status' => 'active'],
        ['id' => 'offer-welcome-drink', 'title' => 'Welcome Drink', 'partnerId' => 'bar-partner', 'city' => 'Innsbruck', 'description' => 'Partner bar welcome drink for selected community nights.', 'code' => 'PLUSDRINK', 'validFrom' => '2026-06-01', 'validUntil' => '2026-09-30', 'tierRequired' => 'plus', 'status' => 'active'],
        ['id' => 'offer-vip-upgrade', 'title' => 'VIP Upgrade Request', 'partnerId' => 'vip-sponsor', 'city' => 'Innsbruck', 'description' => 'Black member VIP upgrade request placeholder.', 'code' => 'BLACKVIP', 'validFrom' => '2026-06-01', 'validUntil' => '2026-12-31', 'tierRequired' => 'black', 'status' => 'active'],
        ['id' => 'offer-shopping', 'title' => 'Private Shopping Benefit', 'partnerId' => 'fashion-partner', 'city' => 'Milan', 'description' => 'Fashion partner code prepared for Passport members.', 'code' => 'HMSTYLE', 'validFrom' => '2026-09-01', 'validUntil' => '2026-10-31', 'tierRequired' => 'plus', 'status' => 'draft'],
    ];
}

function hotmess_app_push_messages(): array
{
    return [
        ['id' => 'push-innsbruck-reminder', 'title' => 'Innsbruck doors open soon', 'body' => 'Your HOTMESS arrival window starts at 22:30. Save your ticket wallet.', 'city' => 'Innsbruck', 'eventId' => 'hm-innsbruck-2026', 'scheduledAt' => '2026-07-18 19:00:00', 'status' => 'draft'],
        ['id' => 'push-safety-note', 'title' => 'Safety and arrival note', 'body' => 'Check the app guide before arrival. Respect private areas and host instructions.', 'city' => 'Innsbruck', 'eventId' => 'hm-innsbruck-2026', 'scheduledAt' => '2026-07-18 18:00:00', 'status' => 'scheduled'],
        ['id' => 'push-hotel-note', 'title' => 'Hotel benefit unlocked', 'body' => 'Passport Plus hotel benefit is available in your offer wallet.', 'city' => 'Vienna', 'eventId' => null, 'scheduledAt' => '2026-08-07 12:00:00', 'status' => 'draft'],
    ];
}

function hotmess_app_city_guide_items(): array
{
    return [
        ['id' => 'guide-rooftop', 'title' => 'Private Rooftop Arrival', 'city' => 'Vienna', 'type' => 'partner_place', 'description' => 'Recommended arrival spot before the rooftop chapter.', 'address' => 'Vienna first district', 'partnerId' => 'bar-partner', 'tierRequired' => 'free', 'status' => 'published'],
        ['id' => 'guide-hotel', 'title' => 'Signature City Stay', 'city' => 'Innsbruck', 'type' => 'hotel', 'description' => 'Hotel partner note with late checkout placeholder.', 'address' => 'Innsbruck center', 'partnerId' => 'hotel-partner', 'tierRequired' => 'plus', 'status' => 'published'],
        ['id' => 'guide-shuttle', 'title' => 'Shuttle Route Note', 'city' => 'Dubrovnik', 'type' => 'shuttle', 'description' => 'Transfer option and arrival guidance for Signature Weekend.', 'address' => 'Coastal zone', 'partnerId' => 'shuttle-partner', 'tierRequired' => 'black', 'status' => 'draft'],
        ['id' => 'guide-safety', 'title' => 'Emergency / Safety Note', 'city' => 'Innsbruck', 'type' => 'safety', 'description' => 'Host support and safety instructions placeholder.', 'address' => 'In app only', 'partnerId' => null, 'tierRequired' => 'free', 'status' => 'published'],
    ];
}

function hotmess_app_partner_placements(): array
{
    return [
        ['id' => 'placement-hotel-banner', 'partnerId' => 'hotel-partner', 'title' => 'Hotel Banner Placement', 'city' => 'Vienna', 'placementType' => 'banner', 'description' => 'Premium banner slot in hotels and city guide screens.', 'code' => 'HOTMESSSTAY', 'tierRequired' => 'plus', 'views' => 2400, 'clicks' => 210, 'redemptions' => 38, 'upgradeOptions' => ['Home screen hero', 'Black-only offer card'], 'status' => 'active'],
        ['id' => 'placement-bar-offer', 'partnerId' => 'bar-partner', 'title' => 'Offer Card Placement', 'city' => 'Innsbruck', 'placementType' => 'offer_card', 'description' => 'Welcome drink card in offers and map screens.', 'code' => 'PLUSDRINK', 'tierRequired' => 'plus', 'views' => 1800, 'clicks' => 188, 'redemptions' => 64, 'upgradeOptions' => ['Push message add-on', 'Community night placement'], 'status' => 'active'],
        ['id' => 'placement-vip', 'partnerId' => 'vip-sponsor', 'title' => 'VIP Upgrade Placement', 'city' => 'Innsbruck', 'placementType' => 'member_card', 'description' => 'Black member VIP upgrade surface.', 'code' => 'BLACKVIP', 'tierRequired' => 'black', 'views' => 920, 'clicks' => 96, 'redemptions' => 14, 'upgradeOptions' => ['Event detail VIP rail', 'Concierge placement'], 'status' => 'active'],
    ];
}

function hotmess_app_saved_items(): array
{
    return [
        ['id' => 'saved-event-1', 'userId' => 'mock-user', 'itemType' => 'event', 'itemId' => 'hm-innsbruck-2026', 'title' => 'Innsbruck Private Weekend', 'savedAt' => '2026-06-02 12:00:00'],
        ['id' => 'saved-package-1', 'userId' => 'mock-user', 'itemType' => 'package', 'itemId' => 'pkg-signature-adriatic-2026', 'title' => 'Signature Weekend Adriatic', 'savedAt' => '2026-06-02 12:10:00'],
        ['id' => 'saved-offer-1', 'userId' => 'mock-user', 'itemType' => 'offer', 'itemId' => 'offer-hotel-late', 'title' => 'Late Checkout Signal', 'savedAt' => '2026-06-02 12:20:00'],
    ];
}

function hotmess_app_feature_by_slug(string $slug): ?array
{
    foreach (hotmess_app_features() as $feature) {
        if ($feature['slug'] === $slug) {
            return $feature;
        }
    }

    return null;
}
