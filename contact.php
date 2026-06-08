<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/inquiry-data.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $ok = hotmess_handle_inquiry_submit(array_merge($_POST, ['type' => 'general']));
    redirect('/contact' . ($ok ? '#success' : '#contact-form'));
}

render_header('Contact');
?>

<main class="contact-page inquiry-page">
  <section class="inquiry-hero">
    <div>
      <p class="eyebrow">Contact / Concierge</p>
      <h1>Tell us where HotMess should meet you.</h1>
      <p>General requests, private questions and early signals for events, travel, partnerships and membership.</p>
      <div class="hero-actions">
        <a class="button primary" href="#contact-form">Kontakt aufnehmen</a>
        <a class="button ghost" href="/membership">Passport ansehen</a>
      </div>
    </div>
  </section>

  <section id="contact-form" class="inquiry-form-section">
    <?php render_inquiry_form('general', [
        'headline' => 'General Contact',
        'buttonLabel' => 'Nachricht senden',
        'messagePlaceholder' => 'Thema, Kontext und wie wir dich erreichen sollen.',
    ]); ?>
  </section>
</main>

<?php render_footer(); ?>
