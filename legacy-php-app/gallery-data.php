<?php

declare(strict_types=1);

require_once __DIR__ . '/events-data.php';

function hotmess_gallery_items(): array
{
    return [
        [
            'id' => 'gallery-innsbruck-aftermovie',
            'title' => 'Innsbruck Private Weekend Aftermovie',
            'slug' => 'innsbruck-private-weekend-aftermovie',
            'city' => 'Innsbruck',
            'eventId' => 'hm-innsbruck-2026',
            'eventName' => 'HOTMESS BLKN: Innsbruck Private Weekend',
            'eventDate' => '2026-09-12',
            'mediaType' => 'aftermovie',
            'coverImage' => '/assets/community-hero.png',
            'images' => ['/assets/community-hero.png', '/assets/waitlist.png', '/assets/packages.png', '/assets/faq.png'],
            'videoUrl' => 'https://player.vimeo.com/video/000000001',
            'videoLength' => '02:48',
            'description' => 'A cinematic archive of the private Innsbruck weekend: arrival moments, late-night silhouettes, host hotel energy and the quiet glow after the room opens.',
            'photographer' => 'HOTMESS Studio',
            'partnerIds' => ['hotel-partner', 'bar-partner'],
            'sponsorIds' => ['vip-sponsor'],
            'visibility' => 'public',
            'status' => 'published',
        ],
        [
            'id' => 'gallery-vienna-passport',
            'title' => 'Vienna Passport Night',
            'slug' => 'vienna-passport-night',
            'city' => 'Vienna',
            'eventId' => 'hm-vienna-2026',
            'eventName' => 'HOTMESS Passport Night Vienna',
            'eventDate' => '2026-10-03',
            'mediaType' => 'photos',
            'coverImage' => '/assets/waitlist.png',
            'images' => ['/assets/waitlist.png', '/assets/community-hero.png', '/assets/packages.png', '/assets/faq.png', '/assets/hero.png'],
            'videoUrl' => '',
            'videoLength' => '',
            'description' => 'Editorial stills from a members-first Vienna chapter with hotel arrivals, low-lit table moments and quiet brand details.',
            'photographer' => 'Mira Studio',
            'partnerIds' => ['hotel-partner', 'fashion-partner'],
            'sponsorIds' => [],
            'visibility' => 'members_only',
            'status' => 'published',
        ],
        [
            'id' => 'gallery-adriatic-signature',
            'title' => 'Adriatic Signature Weekend',
            'slug' => 'adriatic-signature-weekend',
            'city' => 'Dubrovnik',
            'eventId' => 'hm-adriatic-2026',
            'eventName' => 'HOTMESS Adriatic Signature Weekend',
            'eventDate' => '2026-11-07',
            'mediaType' => 'video',
            'coverImage' => '/assets/packages.png',
            'images' => ['/assets/packages.png', '/assets/community-hero.png', '/assets/waitlist.png'],
            'videoUrl' => 'https://player.vimeo.com/video/000000002',
            'videoLength' => '01:36',
            'description' => 'A travel-led campaign cut built around arrival, concierge, dinner, private tables and next-morning city light.',
            'photographer' => 'HOTMESS Travel Studio',
            'partnerIds' => ['hotel-partner', 'shuttle-partner'],
            'sponsorIds' => ['signature-sponsor'],
            'visibility' => 'public',
            'status' => 'draft',
        ],
        [
            'id' => 'gallery-milan-shopping',
            'title' => 'Milan Shopping Night Archive',
            'slug' => 'milan-shopping-night-archive',
            'city' => 'Milan',
            'eventId' => 'hm-milan-2026',
            'eventName' => 'Private Shopping Night',
            'eventDate' => '2026-12-05',
            'mediaType' => 'photos',
            'coverImage' => '/assets/faq.png',
            'images' => ['/assets/faq.png', '/assets/waitlist.png', '/assets/packages.png', '/assets/community-hero.png'],
            'videoUrl' => '',
            'videoLength' => '',
            'description' => 'A fashion-forward image set for partner retail nights, member previews and intimate community movement.',
            'photographer' => 'Luca Archive',
            'partnerIds' => ['fashion-partner'],
            'sponsorIds' => ['welcome-bag-sponsor'],
            'visibility' => 'public',
            'status' => 'published',
        ],
    ];
}

function hotmess_gallery_item_by_slug(string $slug): ?array
{
    foreach (hotmess_gallery_items() as $item) {
        if ($item['slug'] === $slug) {
            return $item;
        }
    }

    return null;
}

function hotmess_gallery_media_label(array $item): string
{
    if ($item['mediaType'] === 'photos') {
        return count($item['images']) . ' images';
    }

    return $item['videoLength'] ?: 'Video';
}

function hotmess_gallery_featured(): array
{
    $items = hotmess_gallery_items();

    foreach ($items as $item) {
        if ($item['mediaType'] === 'aftermovie' && $item['status'] === 'published') {
            return $item;
        }
    }

    return $items[0];
}

function hotmess_gallery_filtered(?string $city, ?string $year, ?string $eventId, ?string $mediaType): array
{
    return array_values(array_filter(hotmess_gallery_items(), function (array $item) use ($city, $year, $eventId, $mediaType): bool {
        if ($city && strtolower($item['city']) !== strtolower($city)) {
            return false;
        }

        if ($year && date('Y', strtotime($item['eventDate'])) !== $year) {
            return false;
        }

        if ($eventId && $item['eventId'] !== $eventId) {
            return false;
        }

        if ($mediaType && $item['mediaType'] !== $mediaType) {
            return false;
        }

        return true;
    }));
}

function hotmess_gallery_partner_placements(): array
{
    return [
        ['id' => 'gallery-placement-event', 'galleryId' => 'gallery-innsbruck-aftermovie', 'partnerId' => 'hotel-partner', 'placementType' => 'event_archive', 'visibility' => 'cover credit, detail partner row, app story placeholder', 'status' => 'active'],
        ['id' => 'gallery-placement-fashion', 'galleryId' => 'gallery-milan-shopping', 'partnerId' => 'fashion-partner', 'placementType' => 'campaign_story', 'visibility' => 'gallery card, photo detail, membership benefit cross-link', 'status' => 'draft'],
    ];
}
