<?php

declare(strict_types=1);

require_once __DIR__ . '/app/events-data.php';
require_once __DIR__ . '/app/hotels-data.php';
require_once __DIR__ . '/app/packages-data.php';
require_once __DIR__ . '/app/gallery-data.php';

$baseUrl = defined('APP_URL') ? rtrim((string) APP_URL, '/') : 'https://hotmess-blkn.com';
$routes = [
    ['/', 'weekly', '1.0'],
    ['/events', 'weekly', '0.9'],
    ['/tickets', 'weekly', '0.8'],
    ['/hotels', 'weekly', '0.8'],
    ['/travel', 'monthly', '0.65'],
    ['/packages', 'weekly', '0.9'],
    ['/community', 'weekly', '0.75'],
    ['/membership', 'weekly', '0.8'],
    ['/app', 'weekly', '0.75'],
    ['/partners', 'monthly', '0.75'],
    ['/partners/referrals', 'monthly', '0.65'],
    ['/partners/analytics', 'monthly', '0.65'],
    ['/partners/campaigns', 'monthly', '0.65'],
    ['/gallery', 'weekly', '0.8'],
    ['/contact', 'monthly', '0.7'],
    ['/concierge', 'weekly', '0.8'],
    ['/app/concierge', 'weekly', '0.65'],
    ['/legal/privacy', 'monthly', '0.4'],
    ['/legal/terms', 'monthly', '0.4'],
    ['/legal/imprint', 'monthly', '0.4'],
    ['/legal/cookies', 'monthly', '0.4'],
    ['/status', 'weekly', '0.4'],
];

foreach (hotmess_events() as $event) {
    $routes[] = ['/events/' . $event['slug'], 'weekly', '0.85'];
}

foreach (hotmess_hotels() as $hotel) {
    $routes[] = ['/hotels/' . $hotel['slug'], 'weekly', '0.75'];
}

foreach (hotmess_packages() as $package) {
    $routes[] = ['/packages/' . $package['slug'], 'weekly', '0.85'];
}

foreach (hotmess_gallery_items() as $item) {
    $routes[] = ['/gallery/' . $item['slug'], 'weekly', '0.75'];
}

header('Content-Type: application/xml; charset=utf-8');
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php foreach ($routes as [$path, $changefreq, $priority]): ?>
  <url>
    <loc><?= htmlspecialchars($baseUrl . ($path === '/' ? '/' : $path), ENT_XML1, 'UTF-8') ?></loc>
    <changefreq><?= htmlspecialchars($changefreq, ENT_XML1, 'UTF-8') ?></changefreq>
    <priority><?= htmlspecialchars($priority, ENT_XML1, 'UTF-8') ?></priority>
  </url>
<?php endforeach; ?>
</urlset>
