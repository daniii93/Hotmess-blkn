<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/concierge-data.php';

$recommendations = hotmess_concierge_recommendations(current_user());
$quickActions = hotmess_concierge_quick_actions();

render_header('HotMess Concierge');
?>

<main class="concierge-page">
  <section class="concierge-hero">
    <div>
      <p class="eyebrow">HotMess Concierge AI</p>
      <h1>Your personal HotMess Concierge</h1>
      <p class="hero-lead">A private advisory layer for events, hotels, packages, city weekends, membership and partner benefits. AI integration is prepared; curated recommendations are available now.</p>
      <div class="hero-actions"><a class="button primary" href="/account/concierge">Personal Concierge</a><a class="button ghost" href="/app/concierge">Open in Guide</a></div>
    </div>
    <aside class="concierge-chat-card">
      <span>Concierge entry</span>
      <strong>Ask with intent.</strong>
      <?php foreach (array_slice($quickActions, 0, 4) as $action): ?>
        <a href="/account/concierge"><?= e($action) ?></a>
      <?php endforeach; ?>
    </aside>
  </section>

  <?php foreach (['events' => 'Recommended Events', 'hotels' => 'Recommended Hotels', 'packages' => 'Recommended Packages', 'community' => 'Community Signals', 'benefits' => 'Membership Benefits'] as $key => $title): ?>
    <section class="platform-section">
      <div class="section-heading platform-heading"><p class="eyebrow">Concierge</p><h2><?= e($title) ?></h2></div>
      <div class="concierge-recommendation-grid">
        <?php foreach ($recommendations[$key] as $item): ?>
          <article class="concierge-recommendation-card">
            <span><?= e($item['type']) ?> / score <?= e((string) $item['score']) ?></span>
            <h3><?= e($item['title']) ?></h3>
            <p><?= e($item['description']) ?></p>
            <a class="button ghost" href="<?= e($item['href']) ?>">View recommendation</a>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php endforeach; ?>
</main>

<?php render_footer(); ?>
