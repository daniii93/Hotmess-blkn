<?php

declare(strict_types=1);

function hotmess_site_url(): string
{
    $envUrl = trim((string) (getenv('SITE_URL') ?: ''));

    if ($envUrl !== '') {
        return rtrim($envUrl, '/');
    }

    if (defined('APP_URL') && trim((string) APP_URL) !== '') {
        return rtrim((string) APP_URL, '/');
    }

    $host = $_SERVER['HTTP_HOST'] ?? 'hotmess-blkn.com';
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';

    return $scheme . '://' . $host;
}

function hotmess_default_og_image(): string
{
    return hotmess_site_url() . '/assets/hero.png';
}

function hotmess_canonical_url(?string $path = null): string
{
    $path = $path ?? parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
    return hotmess_site_url() . '/' . ltrim($path, '/');
}

function hotmess_base_metadata(): array
{
    return [
        'title' => 'HOTMESS BLKN',
        'description' => 'Außergewöhnliche Events, besondere Reiseziele und eine Community für Erinnerungen, Begegnungen und Wochenenden, die bleiben.',
        'keywords' => ['HOTMESS', 'Events', 'Wochenenden', 'Community', 'Reisen', 'Hotels'],
        'canonical' => hotmess_canonical_url(),
        'ogTitle' => 'HOTMESS BLKN',
        'ogDescription' => 'Erinnerungen, Begegnungen, Reisen und besondere Nächte in einer kuratierten HOTMESS Community.',
        'ogImage' => hotmess_default_og_image(),
        'twitterCard' => 'summary_large_image',
        'robots' => 'index,follow',
        'schema' => [],
    ];
}

function build_page_metadata(string $title, array $overrides = []): array
{
    $base = hotmess_base_metadata();
    $metadata = array_merge($base, $overrides);
    $metadata['title'] = $overrides['title'] ?? $title . ' | HOTMESS BLKN';
    $metadata['ogTitle'] = $overrides['ogTitle'] ?? $metadata['title'];
    $metadata['ogDescription'] = $overrides['ogDescription'] ?? $metadata['description'];
    $metadata['canonical'] = $overrides['canonical'] ?? hotmess_canonical_url();
    $metadata['ogImage'] = isset($metadata['ogImage']) && str_starts_with((string) $metadata['ogImage'], 'http')
        ? $metadata['ogImage']
        : hotmess_site_url() . '/' . ltrim((string) ($metadata['ogImage'] ?? '/assets/hero.png'), '/');

    return $metadata;
}

function build_organization_schema(): array
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'HOTMESS BLKN',
        'url' => hotmess_site_url(),
        'logo' => hotmess_default_og_image(),
        'sameAs' => ['https://www.instagram.com/hotmess.blkn.clubbing/'],
    ];
}

function build_website_schema(): array
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => 'HOTMESS BLKN',
        'url' => hotmess_site_url(),
        'description' => 'Curated nights. Private weekends. A community beyond the event.',
    ];
}

function build_breadcrumb_schema(array $items): array
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => array_values(array_map(
            fn (array $item, int $index): array => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['name'],
                'item' => hotmess_site_url() . $item['url'],
            ],
            $items,
            array_keys($items)
        )),
    ];
}

function build_event_schema(array $event): array
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'Event',
        'name' => $event['title'],
        'description' => $event['shortDescription'] ?? $event['description'] ?? '',
        'startDate' => $event['startDate'],
        'endDate' => $event['endDate'],
        'eventStatus' => 'https://schema.org/EventScheduled',
        'eventAttendanceMode' => 'https://schema.org/OfflineEventAttendanceMode',
        'image' => [hotmess_site_url() . '/' . ltrim((string) $event['heroImage'], '/')],
        'location' => [
            '@type' => 'Place',
            'name' => $event['venue'],
            'address' => $event['address'],
        ],
        'organizer' => [
            '@type' => 'Organization',
            'name' => 'HOTMESS BLKN',
            'url' => hotmess_site_url(),
        ],
    ];
}

function build_hotel_schema(array $hotel): array
{
    return [
        '@context' => 'https://schema.org',
        '@type' => 'Hotel',
        'name' => $hotel['title'] ?? $hotel['name'],
        'description' => $hotel['description'],
        'image' => hotmess_site_url() . '/' . ltrim((string) $hotel['heroImage'], '/'),
        'address' => $hotel['address'] ?? $hotel['city'],
    ];
}

function build_event_metadata(array $event): array
{
    return build_page_metadata($event['title'], [
        'title' => $event['title'] . ' | HOTMESS Events',
        'description' => $event['shortDescription'],
        'keywords' => ['HotMess event', $event['city'], $event['venue'], 'VIP', 'membership'],
        'canonical' => hotmess_site_url() . '/events/' . $event['slug'],
        'ogTitle' => $event['title'],
        'ogDescription' => $event['shortDescription'],
        'ogImage' => $event['heroImage'],
        'schema' => [
            build_event_schema($event),
            build_breadcrumb_schema([
                ['name' => 'Home', 'url' => '/'],
                ['name' => 'Events', 'url' => '/events'],
                ['name' => $event['title'], 'url' => '/events/' . $event['slug']],
            ]),
        ],
    ]);
}

function build_hotel_metadata(array $hotel): array
{
    $title = $hotel['title'] ?? $hotel['name'];
    return build_page_metadata($title, [
        'title' => $title . ' | HotMess Hotels',
        'description' => $hotel['description'],
        'keywords' => ['HotMess hotel', $hotel['city'], 'travel', 'membership benefits'],
        'canonical' => hotmess_site_url() . '/hotels/' . $hotel['slug'],
        'ogTitle' => $title,
        'ogDescription' => $hotel['description'],
        'ogImage' => $hotel['heroImage'],
        'schema' => [
            build_hotel_schema($hotel),
            build_breadcrumb_schema([
                ['name' => 'Home', 'url' => '/'],
                ['name' => 'Hotels', 'url' => '/hotels'],
                ['name' => $title, 'url' => '/hotels/' . $hotel['slug']],
            ]),
        ],
    ]);
}

function build_package_metadata(array $package): array
{
    return build_page_metadata($package['title'], [
        'title' => $package['title'] . ' | HotMess Weekends',
        'description' => $package['shortDescription'],
        'keywords' => ['HotMess weekend', $package['city'], $package['packageType'], 'VIP package', 'travel'],
        'canonical' => hotmess_site_url() . '/packages/' . $package['slug'],
        'ogTitle' => $package['title'],
        'ogDescription' => $package['shortDescription'],
        'ogImage' => $package['heroImage'],
        'schema' => [
            build_breadcrumb_schema([
                ['name' => 'Home', 'url' => '/'],
                ['name' => 'Packages', 'url' => '/packages'],
                ['name' => $package['title'], 'url' => '/packages/' . $package['slug']],
            ]),
        ],
    ]);
}

function build_gallery_metadata(array $item): array
{
    return build_page_metadata($item['title'], [
        'title' => $item['title'] . ' | HotMess Gallery',
        'description' => $item['description'],
        'keywords' => ['HotMess gallery', $item['city'], $item['mediaType'], 'aftermovie', 'event archive'],
        'canonical' => hotmess_site_url() . '/gallery/' . $item['slug'],
        'ogTitle' => $item['title'],
        'ogDescription' => $item['description'],
        'ogImage' => $item['coverImage'],
        'schema' => [
            build_breadcrumb_schema([
                ['name' => 'Home', 'url' => '/'],
                ['name' => 'Gallery', 'url' => '/gallery'],
                ['name' => $item['title'], 'url' => '/gallery/' . $item['slug']],
            ]),
        ],
    ]);
}

function hotmess_metadata_for_path(string $title): array
{
    $path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
    $aliases = [
        '/index.php' => '/',
        '/events.php' => '/events',
        '/tickets.php' => '/tickets',
        '/hotels.php' => '/hotels',
        '/travel.php' => '/travel',
        '/packages.php' => '/packages',
        '/community.php' => '/community',
        '/membership.php' => '/membership',
        '/app-page.php' => '/app',
        '/partners.php' => '/partners',
        '/gallery.php' => '/gallery',
        '/contact.php' => '/contact',
    ];
    $path = $aliases[$path] ?? $path;
    $map = [
        '/' => ['HOTMESS Erinnerungen', 'Außergewöhnliche Events, besondere Reiseziele und eine Community für Erinnerungen, Begegnungen und Wochenenden, die bleiben.', '/assets/hero.png'],
        '/events' => ['Events', 'Luxury event chapters with tickets, VIP access, hotel notes and Passport early access.', '/assets/community-hero.png'],
        '/tickets' => ['Tickets', 'Ticket access, VIP requests and Passport member allocation for upcoming HotMess chapters.', '/assets/hero.png'],
        '/hotels' => ['Hotels & Travel', 'Host hotel benefits, travel notes and premium stay layers for HotMess weekends.', '/assets/packages.png'],
        '/travel' => ['Travel', 'Travel signals, city guidance and premium movement around HotMess weekends.', '/assets/packages.png'],
        '/packages' => ['HotMess Weekends', 'Your HotMess weekend starts before the door opens: event, hotel, app and VIP layers.', '/assets/packages.png'],
        '/community' => ['HotMess Circle', 'A private community layer for pre-drinks, brunch, travel meetups and member-only moments.', '/assets/community-hero.png'],
        '/membership' => ['HotMess Passport', 'Membership for early access, hotel benefits, partner offers and a community beyond the event.', '/assets/waitlist.png'],
        '/app' => ['HotMess Guide', 'A digital concierge for tickets, hotels, packages, partner offers and member benefits.', '/assets/packages.png'],
        '/partners' => ['Partner & Sponsors', 'Premium partnerships across events, hotels, packages, membership, app and community.', '/assets/packages.png'],
        '/partners/referrals' => ['Partner Referrals', 'Referral performance for premium partners, campaign leads and booking signals.', '/assets/packages.png'],
        '/partners/analytics' => ['Partner Analytics', 'Premium reporting for partner views, clicks, leads, bookings and redemptions.', '/assets/packages.png'],
        '/partners/campaigns' => ['Partner Campaigns', 'Campaign planning for partner visibility, app offers, benefits and referral journeys.', '/assets/packages.png'],
        '/gallery' => ['Gallery', 'A cinematic archive of HotMess aftermovies, photo stories and campaign moments.', '/assets/community-hero.png'],
        '/contact' => ['Contact', 'Concierge contact for packages, hotels, VIP tables, partnerships and general HotMess requests.', '/assets/community-hero.png'],
        '/concierge' => ['HotMess Concierge', 'Your personal HotMess Concierge for events, hotels, packages, membership and city weekends.', '/assets/packages.png'],
        '/app/concierge' => ['App Concierge', 'Mobile-first concierge guidance inside the HotMess Guide.', '/assets/packages.png'],
        '/legal/privacy' => ['Privacy', 'Prepared privacy structure for HotMess data protection and DSGVO readiness.', '/assets/hero.png'],
        '/legal/terms' => ['Terms', 'Prepared terms structure for the HotMess platform.', '/assets/hero.png'],
        '/legal/imprint' => ['Imprint', 'Prepared imprint structure for HotMess legal identification.', '/assets/hero.png'],
        '/legal/cookies' => ['Cookies', 'Prepared cookie and consent structure for HotMess.', '/assets/hero.png'],
        '/status' => ['System Status', 'HotMess platform status and integration readiness.', '/assets/hero.png'],
    ];
    $entry = $map[$path] ?? [$title, 'Events, hotels, travel and membership in one premium HotMess experience.', '/assets/hero.png'];
    $robots = (str_starts_with($path, '/admin') || str_starts_with($path, '/account')) ? 'noindex,nofollow' : 'index,follow';

    return build_page_metadata($entry[0], [
        'title' => $entry[0] . ' | HOTMESS BLKN',
        'description' => $entry[1],
        'canonical' => hotmess_site_url() . ($path === '/' ? '/' : $path),
        'robots' => $robots,
        'ogTitle' => $entry[0],
        'ogDescription' => $entry[1],
        'ogImage' => $entry[2],
        'schema' => $path === '/'
            ? [build_organization_schema(), build_website_schema()]
            : [build_organization_schema()],
    ]);
}

function render_seo_tags(array $metadata): void
{
    $keywords = implode(', ', array_map('strval', (array) ($metadata['keywords'] ?? [])));
    ?>
        <title><?= e((string) $metadata['title']) ?></title>
        <meta name="description" content="<?= e((string) $metadata['description']) ?>" />
        <meta name="keywords" content="<?= e($keywords) ?>" />
        <link rel="canonical" href="<?= e((string) $metadata['canonical']) ?>" />
        <meta name="robots" content="<?= e((string) $metadata['robots']) ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="HOTMESS BLKN" />
        <meta property="og:title" content="<?= e((string) $metadata['ogTitle']) ?>" />
        <meta property="og:description" content="<?= e((string) $metadata['ogDescription']) ?>" />
        <meta property="og:image" content="<?= e((string) $metadata['ogImage']) ?>" />
        <meta property="og:url" content="<?= e((string) $metadata['canonical']) ?>" />
        <meta name="twitter:card" content="<?= e((string) $metadata['twitterCard']) ?>" />
        <meta name="twitter:title" content="<?= e((string) $metadata['ogTitle']) ?>" />
        <meta name="twitter:description" content="<?= e((string) $metadata['ogDescription']) ?>" />
        <meta name="twitter:image" content="<?= e((string) $metadata['ogImage']) ?>" />
        <?php foreach ((array) ($metadata['schema'] ?? []) as $schema): ?>
          <script type="application/ld+json"><?= json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?></script>
        <?php endforeach; ?>
    <?php
}
