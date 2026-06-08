<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/platformSections.php';
require_once __DIR__ . '/layout.php';
require_once __DIR__ . '/components.php';

function platform_sample_items(string $slug): array
{
    return match ($slug) {
        'events' => [
            ['title' => 'Innsbruck Private Weekend', 'slug' => 'innsbruck-private-weekend', 'description' => 'A controlled destination chapter with guest list, music and late-night hospitality.', 'image' => '/assets/community-hero.png'],
            ['title' => 'Rooftop Arrival', 'slug' => 'rooftop-arrival', 'description' => 'A visual-first event concept prepared for premium launch storytelling.', 'image' => '/assets/waitlist.png'],
            ['title' => 'After Dark Table', 'slug' => 'after-dark-table', 'description' => 'Table-led access for selected groups and partner-hosted moments.', 'image' => '/assets/packages.png'],
        ],
        'hotels' => [
            ['title' => 'Signature City Stay', 'slug' => 'signature-city-stay', 'description' => 'A refined base for guests who want the full weekend to feel intentional.', 'image' => '/assets/packages.png'],
            ['title' => 'Late Checkout Partner', 'slug' => 'late-checkout-partner', 'description' => 'Hotel collaboration placeholder for negotiated guest benefits.', 'image' => '/assets/community-hero.png'],
            ['title' => 'Private Arrival Suite', 'slug' => 'private-arrival-suite', 'description' => 'Prepared for concierge notes, airport transfers and premium rooms.', 'image' => '/assets/faq.png'],
        ],
        'packages' => [
            ['title' => 'Weekend Suite', 'slug' => 'weekend-suite', 'description' => 'Event access, hotel direction and table options bundled for small groups.', 'image' => '/assets/packages.png'],
            ['title' => 'Member Escape', 'slug' => 'member-escape', 'description' => 'A travel-friendly structure for future city-to-city HOTMESS chapters.', 'image' => '/assets/community-hero.png'],
            ['title' => 'Partner Hosted', 'slug' => 'partner-hosted', 'description' => 'Sponsor-ready package layer for hospitality and premium brand partners.', 'image' => '/assets/waitlist.png'],
        ],
        'membership' => [
            ['title' => 'Guest', 'slug' => 'guest', 'description' => 'Apply, verify and receive controlled access to tickets and community.', 'image' => '/assets/waitlist.png'],
            ['title' => 'Inner Circle', 'slug' => 'inner-circle', 'description' => 'Prepared tier for priority access, travel moments and private drops.', 'image' => '/assets/community-hero.png'],
            ['title' => 'Host', 'slug' => 'host', 'description' => 'Future role for tastemakers, promoters and curated guest introductions.', 'image' => '/assets/packages.png'],
        ],
        'partners' => [
            ['title' => 'Hotel Partner', 'slug' => 'hotel-partner', 'description' => 'For boutique hotels and premium stays connected to event weekends.', 'image' => '/assets/packages.png'],
            ['title' => 'Sponsor Partner', 'slug' => 'sponsor-partner', 'description' => 'For brands that need elegant visibility without loud advertising.', 'image' => '/assets/community-hero.png'],
            ['title' => 'Travel Partner', 'slug' => 'travel-partner', 'description' => 'For mobility, destination and concierge collaborations.', 'image' => '/assets/faq.png'],
        ],
        default => [
            ['title' => 'Premium content layer', 'slug' => $slug . '-content', 'description' => 'A structured content block ready for imagery, video and operational data.', 'image' => '/assets/community-hero.png'],
            ['title' => 'Member journey', 'slug' => $slug . '-member', 'description' => 'Customer-facing benefits and conversion points prepared for expansion.', 'image' => '/assets/waitlist.png'],
            ['title' => 'Partner surface', 'slug' => $slug . '-partner', 'description' => 'Partner and sponsor perspective already planned in the page architecture.', 'image' => '/assets/packages.png'],
        ],
    };
}

function render_platform_page(string $slug, ?string $detailSlug = null): void
{
    $section = platform_section($slug);

    if (!$section) {
        http_response_code(404);
        $section = [
            'title' => 'Not found',
            'slug' => 'not-found',
            'description' => 'This HOTMESS platform area does not exist yet.',
            'customerBenefits' => [],
            'adminFeatures' => [],
            'partnerBenefits' => [],
            'ctaLabel' => 'Back home',
            'href' => '/',
        ];
    }

    $isDetail = $detailSlug !== null && $detailSlug !== '';
    $title = $isDetail ? ucwords(str_replace('-', ' ', $detailSlug)) : $section['title'];
    $heroSection = $section;
    $heroSection['title'] = $isDetail ? $title : $section['title'];
    $heroSection['description'] = $isDetail
        ? 'A premium detail page foundation for ' . $title . ', ready for imagery, pricing, availability and partner content.'
        : $section['description'];

    render_header($title);
    ?>
    <main class="platform-page platform-page--<?= e($section['slug']) ?>">
      <?php render_luxury_hero($heroSection, ['eyebrow' => $isDetail ? $section['title'] : 'HOTMESS BLKN']); ?>

      <section class="platform-section">
        <?php render_section_header('Platform architecture', 'Built for three perspectives', 'Every HOTMESS area is prepared for guest experience, organizer operations and partner value without mixing responsibilities.'); ?>
        <?php render_feature_grid($section); ?>
      </section>

      <section class="platform-media-block">
        <div class="platform-media-block__media" aria-label="Image or video placeholder"></div>
        <div>
          <p class="eyebrow">Editorial space</p>
          <h2>Designed for visual storytelling.</h2>
          <p>Large image and video areas are reserved from the beginning, so events, hotels, packages and sponsors can feel like a premium editorial product instead of a generic listing.</p>
          <div class="hero-actions">
            <?php render_cta_button($section['ctaLabel'], $section['href']); ?>
            <?php render_cta_button('Open account', '/account', 'ghost'); ?>
          </div>
        </div>
      </section>

      <section class="platform-section">
        <?php render_section_header('Selected modules', $isDetail ? 'Detail page blocks' : 'Landingpage blocks', 'Initial cards are intentionally clean placeholders for the content and workflows that will follow.'); ?>
        <div class="platform-card-grid">
          <?php foreach (platform_sample_items($section['slug']) as $item): ?>
            <?php
              if ($section['slug'] === 'events') {
                  render_event_card($item);
              } elseif ($section['slug'] === 'hotels') {
                  render_hotel_card($item);
              } elseif ($section['slug'] === 'packages') {
                  render_package_card($item);
              } elseif ($section['slug'] === 'partners') {
                  render_partner_card($item);
              } elseif ($section['slug'] === 'membership') {
                  render_membership_tier_card($item);
              } else {
                  render_typed_card('PremiumCard', $item, (string) $section['href']);
              }
            ?>
          <?php endforeach; ?>
        </div>
      </section>

      <?php render_admin_layout_shell($section); ?>
      <?php render_partner_portal_layout_shell($section); ?>
    </main>
    <?php
    render_footer();
}
