<?php

declare(strict_types=1);

function hotmess_admin_hotels(): array
{
    return [
        ['id' => 'signature-city-stay', 'name' => 'Signature City Stay', 'city' => 'Innsbruck', 'partnerStatus' => 'active', 'shuttleActive' => true, 'fastLaneActive' => false, 'status' => 'active'],
        ['id' => 'late-checkout-partner', 'name' => 'Late Checkout Partner', 'city' => 'Vienna', 'partnerStatus' => 'active', 'shuttleActive' => false, 'fastLaneActive' => true, 'status' => 'active'],
        ['id' => 'private-arrival-suite', 'name' => 'Private Arrival Suite', 'city' => 'Dubrovnik', 'partnerStatus' => 'lead', 'shuttleActive' => true, 'fastLaneActive' => true, 'status' => 'draft'],
    ];
}

function hotmess_admin_community_events(): array
{
    return [
        ['id' => 'community-predrinks-innsbruck', 'title' => 'Passport Pre-Drinks', 'city' => 'Innsbruck', 'eventType' => 'Pre-Drinks', 'memberOnly' => true, 'capacity' => 60, 'registrationRequired' => true, 'status' => 'published'],
        ['id' => 'community-brunch-vienna', 'title' => 'HotMess Brunch Circle', 'city' => 'Vienna', 'eventType' => 'Brunch', 'memberOnly' => true, 'capacity' => 34, 'registrationRequired' => true, 'status' => 'draft'],
        ['id' => 'community-shopping-milan', 'title' => 'Private Shopping Night', 'city' => 'Milan', 'eventType' => 'Shopping Night', 'memberOnly' => false, 'capacity' => 80, 'registrationRequired' => true, 'status' => 'published'],
    ];
}

function hotmess_admin_inquiries(): array
{
    return [
        ['id' => 'inq-package-1', 'type' => 'Package Anfrage', 'subject' => 'Signature Weekend Adriatic', 'name' => 'Sophia K.', 'email' => 'sophia@example.com', 'status' => 'new', 'createdAt' => '2026-06-02 11:20'],
        ['id' => 'inq-hotel-1', 'type' => 'Hotel Anfrage', 'subject' => 'Late checkout Vienna', 'name' => 'Marco R.', 'email' => 'marco@example.com', 'status' => 'contacted', 'createdAt' => '2026-06-02 10:15'],
        ['id' => 'inq-partner-1', 'type' => 'Partner Bewerbung', 'subject' => 'Private Wellness Studio', 'name' => 'Wellness Lead', 'email' => 'wellness@example.com', 'status' => 'new', 'createdAt' => '2026-06-01 18:40'],
        ['id' => 'inq-vip-1', 'type' => 'VIP / Table Anfrage', 'subject' => 'Innsbruck Private Weekend', 'name' => 'Daniel V.', 'email' => 'daniel@example.com', 'status' => 'new', 'createdAt' => '2026-06-01 16:25'],
    ];
}

function hotmess_admin_settings(): array
{
    return [
        'brandName' => 'HOTMESS BLKN',
        'contactEmail' => 'hello@hotmess-blkn.com',
        'instagram' => 'https://www.instagram.com/hotmess.blkn.clubbing/',
        'ticketProvider' => 'Internal simulation / external provider placeholder',
        'stripeStatus' => 'Stripe placeholder prepared, not connected',
        'appMode' => 'PWA shell prepared',
    ];
}

function hotmess_admin_quick_actions(): array
{
    return [
        ['label' => 'Neues Event erstellen', 'href' => '/admin/events#create'],
        ['label' => 'Neues Hotel hinzufuegen', 'href' => '/admin/hotels#create'],
        ['label' => 'Neues Package erstellen', 'href' => '/admin/packages#create'],
        ['label' => 'Community Event erstellen', 'href' => '/admin/community#create'],
        ['label' => 'Partner hinzufuegen', 'href' => '/admin/partners#create'],
        ['label' => 'App Nachricht vorbereiten', 'href' => '/admin/app#create'],
    ];
}
