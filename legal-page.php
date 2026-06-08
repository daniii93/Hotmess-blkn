<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/production-data.php';

$type = (string) ($_GET['type'] ?? 'privacy');
$pages = hotmess_legal_pages();
$page = $pages[$type] ?? $pages['privacy'];

render_header($page['title']);
?>

<main class="legal-page">
  <section class="legal-hero">
    <p class="eyebrow">Legal / Prepared Template</p>
    <h1><?= e($page['title']) ?></h1>
    <p><?= e($page['description']) ?></p>
    <p class="field-hint">Hinweis: Diese Seite ist eine professionelle Strukturvorlage und muss vor echtem Launch juristisch geprueft werden.</p>
  </section>
  <section class="legal-content">
    <?php foreach ($page['sections'] as $section): ?>
      <article class="premium-card"><span>Prepared section</span><h2><?= e($section) ?></h2><p>Inhalt wird final mit rechtlicher Beratung, Betreiberangaben und produktiven Integrationen ausgefuellt.</p></article>
    <?php endforeach; ?>
  </section>
</main>

<?php render_footer(); ?>
