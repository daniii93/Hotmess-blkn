<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/concierge-data.php';

$user = current_user();
$recommendations = hotmess_concierge_recommendations($user);

render_header('App Concierge');
?>

<main class="app-page app-concierge-page">
  <section class="app-hero">
    <div>
      <p class="eyebrow">HotMess Guide / Concierge</p>
      <h1>Concierge in your pocket.</h1>
      <p>Mobile-first guidance for tickets, hotels, packages, partner benefits and city movement.</p>
    </div>
  </section>
  <section class="app-phone-shell concierge-phone-shell">
    <div class="concierge-mobile-chat">
      <p class="eyebrow">Quick Actions</p>
      <?php foreach (array_slice(hotmess_concierge_quick_actions(), 0, 5) as $action): ?>
        <button class="concierge-chip" type="button"><?= e($action) ?></button>
      <?php endforeach; ?>
      <article class="concierge-message concierge-message--assistant">
        <span>Concierge</span>
        <p>Your strongest next step is <?= e($recommendations['packages'][0]['title']) ?>, paired with <?= e($recommendations['hotels'][0]['title']) ?>.</p>
      </article>
    </div>
  </section>
</main>

<?php render_footer(); ?>
