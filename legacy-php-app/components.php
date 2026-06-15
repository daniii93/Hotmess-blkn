<?php

declare(strict_types=1);

function render_cta_button(string $label, string $href, string $variant = 'primary'): void
{
    echo '<a class="button ' . e($variant) . '" href="' . e($href) . '">' . e($label) . '</a>';
}

function render_luxury_hero(array $section, array $options = []): void
{
    $eyebrow = $options['eyebrow'] ?? 'HOTMESS Platform';
    $image = $options['image'] ?? '/assets/community-hero.png';
    $secondaryHref = $options['secondaryHref'] ?? '/membership';
    $secondaryLabel = $options['secondaryLabel'] ?? 'Request access';
    ?>
    <section class="luxury-hero">
      <div class="luxury-hero__image" style="background-image: url('<?= e($image) ?>')" aria-hidden="true"></div>
      <div class="luxury-hero__overlay"></div>
      <div class="luxury-hero__content">
        <p class="eyebrow"><?= e($eyebrow) ?></p>
        <h1><?= e($section['title']) ?></h1>
        <p class="hero-lead"><?= e($section['description']) ?></p>
        <div class="hero-actions">
          <?php render_cta_button((string) $section['ctaLabel'], (string) $section['href']); ?>
          <?php render_cta_button($secondaryLabel, $secondaryHref, 'ghost'); ?>
        </div>
      </div>
      <aside class="luxury-hero__note">
        <span>Three perspectives</span>
        <strong>Guest / Admin / Partner</strong>
        <p>Prepared for customer journeys, organizer operations and premium partner activations.</p>
      </aside>
    </section>
    <?php
}

function render_section_header(string $eyebrow, string $title, string $text = ''): void
{
    ?>
    <div class="section-heading platform-heading">
      <p class="eyebrow"><?= e($eyebrow) ?></p>
      <h2><?= e($title) ?></h2>
      <?php if ($text !== ''): ?>
        <p><?= e($text) ?></p>
      <?php endif; ?>
    </div>
    <?php
}

function render_premium_card(string $title, string $text, string $meta = ''): void
{
    ?>
    <article class="premium-card">
      <?php if ($meta !== ''): ?><span><?= e($meta) ?></span><?php endif; ?>
      <h3><?= e($title) ?></h3>
      <p><?= e($text) ?></p>
    </article>
    <?php
}

function render_feature_grid(array $section): void
{
    $groups = [
        'Customer view' => $section['customerBenefits'],
        'Admin / organizer view' => $section['adminFeatures'],
        'Partner / sponsor view' => $section['partnerBenefits'],
    ];
    ?>
    <div class="feature-grid">
      <?php foreach ($groups as $title => $items): ?>
        <article class="premium-card">
          <span><?= e($title) ?></span>
          <h3><?= e($title === 'Customer view' ? 'For guests' : ($title === 'Admin / organizer view' ? 'For operators' : 'For partners')) ?></h3>
          <ul class="luxury-list">
            <?php foreach ($items as $item): ?>
              <li><?= e($item) ?></li>
            <?php endforeach; ?>
          </ul>
        </article>
      <?php endforeach; ?>
    </div>
    <?php
}

function render_event_card(array $item): void
{
    render_typed_card('EventCard', $item, '/events/' . ($item['slug'] ?? 'innsbruck-private-weekend'));
}

function render_hotel_card(array $item): void
{
    render_typed_card('HotelCard', $item, '/hotels/' . ($item['slug'] ?? 'signature-stay'));
}

function render_package_card(array $item): void
{
    render_typed_card('PackageCard', $item, '/packages/' . ($item['slug'] ?? 'weekend-suite'));
}

function render_partner_card(array $item): void
{
    render_typed_card('PartnerCard', $item, '/partners');
}

function render_membership_tier_card(array $item): void
{
    render_typed_card('MembershipTierCard', $item, '/membership');
}

function render_typed_card(string $type, array $item, string $href): void
{
    ?>
    <article class="platform-card">
      <div class="platform-card__media" style="background-image: url('<?= e($item['image'] ?? '/assets/packages.png') ?>')" aria-hidden="true"></div>
      <div class="platform-card__body">
        <span><?= e($type) ?></span>
        <h3><?= e($item['title'] ?? 'HOTMESS Experience') ?></h3>
        <p><?= e($item['description'] ?? 'A premium placeholder prepared for the next content layer.') ?></p>
        <a href="<?= e($href) ?>">Open</a>
      </div>
    </article>
    <?php
}

function render_admin_layout_shell(array $section): void
{
    ?>
    <section class="portal-shell admin-layout-shell">
      <div>
        <p class="eyebrow">AdminLayout</p>
        <h2>Operational foundation</h2>
        <p><?= e($section['description']) ?></p>
      </div>
      <div class="portal-shell__rail">
        <span>Members</span>
        <span>Inventory</span>
        <span>Sales</span>
        <span>Partner signals</span>
      </div>
    </section>
    <?php
}

function render_partner_portal_layout_shell(array $section): void
{
    ?>
    <section class="portal-shell partner-portal-layout-shell">
      <div>
        <p class="eyebrow">PartnerPortalLayout</p>
        <h2>Partner-ready structure</h2>
        <p>Each area is prepared for sponsor visibility, referral reporting and hotel or travel collaboration content.</p>
      </div>
      <div class="portal-shell__rail">
        <span>Brand profile</span>
        <span>Offers</span>
        <span>Referrals</span>
        <span>Reporting</span>
      </div>
    </section>
    <?php
}
