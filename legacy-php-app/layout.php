<?php

declare(strict_types=1);

require_once __DIR__ . '/platformSections.php';
require_once __DIR__ . '/seo.php';

function render_header(string $title, ?array $metadata = null): void
{
    $user = current_user();
    $realUser = authenticated_user();
    $isRealAdmin = (($realUser['role'] ?? '') === 'admin');
    $isCustomerView = admin_is_viewing_as_customer();
    $isSalesView = admin_is_viewing_as_sales();
    $hasSalesAccess = user_has_sales_access($realUser);
    $navItems = platform_nav_items();
    $metadata = $metadata ?? hotmess_metadata_for_path($title);
    $currentPath = trim(parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/', '/');
    $currentTopSegment = $currentPath === '' ? 'home' : explode('/', $currentPath)[0];
    $isPartnerSalesNavActive = $currentTopSegment === 'partner-dashboard.php';
    ?>
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#080706" />
        <?php render_seo_tags($metadata); ?>
        <link rel="preload" href="/assets/hero.png" as="image" />
        <link rel="stylesheet" href="/styles.css?v=20260612-masterplan-section-02" />
        <link rel="stylesheet" href="/styles-motion.css?v=20260607-kinetic" />
        <script defer src="/script.js?v=20260606-nav-active"></script>
      </head>
      <body>
        <header class="site-header">
          <label class="language-switcher" aria-label="Sprache wechseln">
          <span data-i18n="Sprache">Sprache</span>
            <select data-language-switcher>
              <option value="de">Deutsch (AT)</option>
              <option value="it">Italiano</option>
              <option value="hr">Hrvatski</option>
              <option value="sr">Srpski</option>
            </select>
          </label>
          <a class="brand" href="/" aria-label="HOTMESS BLKN Startseite">
            <span class="brand-mark">HB</span>
            <span>HOTMESS BLKN</span>
          </a>
          <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <nav id="main-nav" class="main-nav" aria-label="Hauptnavigation">
            <?php foreach ($navItems as $item): ?>
              <?php
                if (($item['slug'] ?? '') === 'admin' && (!$isRealAdmin || $isCustomerView || $isSalesView)) {
                    continue;
                }
              ?>
              <?php
                $itemPath = trim(parse_url((string) ($item['href'] ?? '/'), PHP_URL_PATH) ?: '/', '/');
                $itemSegment = $itemPath === '' ? 'home' : explode('/', $itemPath)[0];
                $isActiveNavItem = $itemSegment === $currentTopSegment;
              ?>
              <a class="<?= $isActiveNavItem ? 'nav-active' : '' ?>" href="<?= e((string) $item['href']) ?>">
                <?= e((string) $item['title']) ?>
              </a>
            <?php endforeach; ?>
            <?php if ($user): ?>
              <?php if (($user['role'] ?? '') !== 'admin' && !$isSalesView): ?>
                <a class="nav-utility <?= $currentTopSegment === 'profile.php' ? 'nav-active' : '' ?>" href="/profile.php">Profil</a>
              <?php endif; ?>
              <a class="nav-utility <?= $currentTopSegment === 'feed' ? 'nav-active' : '' ?>" href="/feed">Feed</a>
              <a class="nav-utility <?= $currentTopSegment === 'friends' ? 'nav-active' : '' ?>" href="/friends">Freunde</a>
              <a class="nav-utility <?= $currentTopSegment === 'notifications' ? 'nav-active' : '' ?>" href="/notifications">Updates</a>
              <?php if ($hasSalesAccess && !$isCustomerView && !$isRealAdmin): ?>
                <a class="nav-utility <?= $isPartnerSalesNavActive ? 'nav-active' : '' ?>" href="/partner-dashboard.php">Vertrieb</a>
              <?php endif; ?>
              <a class="nav-utility <?= $currentTopSegment === 'chat' ? 'nav-active' : '' ?>" href="/chat">Chat</a>
              <?php if ($isRealAdmin && !$isCustomerView && !$isSalesView): ?>
                <a class="nav-utility <?= $currentTopSegment === 'admin-sales.php' ? 'nav-active' : '' ?>" href="/admin-sales.php">Sales</a>
                <a class="nav-utility <?= $currentTopSegment === 'organizer-messages.php' ? 'nav-active' : '' ?>" href="/organizer-messages.php">Organizer</a>
              <?php endif; ?>
              <?php if ($isRealAdmin): ?>
                <form class="admin-view-switch" method="post" action="/admin-view-mode.php">
                  <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                  <input type="hidden" name="return_to" value="<?= e((string) ($_SERVER['REQUEST_URI'] ?? '/')) ?>" />
                  <?php if ($isCustomerView): ?>
                    <button class="is-active" name="mode" value="admin" type="submit">Admin-Ansicht</button>
                  <?php else: ?>
                    <button class="<?= !$isSalesView ? 'is-active' : '' ?>" name="mode" value="admin" type="submit">Admin</button>
                    <button name="mode" value="customer" type="submit">Kundensicht</button>
                    <button class="<?= $isSalesView ? 'is-active' : '' ?>" name="mode" value="sales" type="submit">Vertrieb</button>
                  <?php endif; ?>
                </form>
              <?php endif; ?>
              <a class="nav-utility" href="/logout.php">Abmelden</a>
            <?php else: ?>
              <a class="nav-utility <?= $currentTopSegment === 'login.php' ? 'nav-active' : '' ?>" href="/login.php">Anmelden</a>
            <?php endif; ?>
          </nav>
        </header>
    <?php
}

function render_footer(): void
{
    ?>
        <footer class="site-footer">
          <span>HOTMESS BLKN</span>
          <a href="https://www.instagram.com/hotmess.blkn.clubbing/" target="_blank" rel="noreferrer">Instagram</a>
        </footer>
      </body>
    </html>
    <?php
}

function render_flash(): void
{
    $message = flash();

    if ($message) {
        echo '<p class="notice">' . e($message) . '</p>';
    }
}
