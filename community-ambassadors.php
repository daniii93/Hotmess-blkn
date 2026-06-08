<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/inquiry-data.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    hotmess_handle_inquiry_submit(array_merge($_POST, [
        'type' => 'ambassador',
        'subject' => 'Ambassador Application',
    ]));
    redirect('/community/ambassadors#ambassador-apply');
}

render_header('Ambassadors');
?>

<main class="community-page inquiry-page">
  <section class="inquiry-hero ambassador-hero">
    <div>
      <p class="eyebrow">HotMess Circle / Ambassadors</p>
      <h1>Become part of the room before the room opens.</h1>
      <p>City, Travel, VIP and Brand Ambassadors help shape the HotMess Circle with taste, care and trusted social energy.</p>
      <div class="hero-actions">
        <a class="button primary" href="#ambassador-apply">Bewerben</a>
        <a class="button ghost" href="/community">Community ansehen</a>
      </div>
    </div>
  </section>

  <section class="platform-section">
    <div class="membership-tier-grid">
      <?php foreach (['City Ambassador', 'Travel Ambassador', 'VIP Ambassador', 'Brand Ambassador'] as $role): ?>
        <article class="membership-tier-card">
          <span>Ambassador</span>
          <h3><?= e($role) ?></h3>
          <p>Prepared role for hosted community moments, travel signals, partner benefits and selected event visibility.</p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section id="ambassador-apply" class="inquiry-form-section">
    <?php render_inquiry_form('ambassador', [
        'headline' => 'Ambassador Bewerbung',
        'buttonLabel' => 'Bewerbung senden',
        'messagePlaceholder' => 'Tell us why you fit the HotMess Circle and which city or format you want to represent.',
    ]); ?>
  </section>
</main>

<?php render_footer(); ?>
