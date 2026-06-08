<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/production-data.php';

$status = hotmess_system_status();
render_header('System Status');
?>
<main class="legal-page status-page">
  <section class="legal-hero"><p class="eyebrow">Status</p><h1>HotMess platform status</h1><p>Production readiness view with mock and live integration signals.</p></section>
  <section class="account-card-grid">
    <?php foreach ($status['integrations'] as $integration): ?>
      <article class="premium-card"><span><?= e($integration['status']) ?></span><h2><?= e($integration['name']) ?></h2><p>Integration status for public operations monitoring.</p></article>
    <?php endforeach; ?>
  </section>
</main>
<?php render_footer(); ?>
