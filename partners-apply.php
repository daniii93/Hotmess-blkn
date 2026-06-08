<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/partners-data.php';
require_once __DIR__ . '/app/inquiry-data.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    hotmess_handle_inquiry_submit(array_merge($_POST, [
        'type' => 'partner',
        'subject' => 'Partner Application',
    ]));
    redirect('/partners/apply#partner-apply-form');
}

$categories = hotmess_partner_categories();
$interests = ['Events', 'Hotels', 'Packages', 'Community', 'Membership', 'App'];

render_header('Become a Partner');
?>

<main class="partners-page partners-apply-page">
  <section class="partners-hero partners-apply-hero">
    <div class="partners-hero__image" aria-hidden="true"></div>
    <div class="partners-hero__overlay"></div>
    <div class="partners-hero__content">
      <p class="eyebrow">Partner Application</p>
      <h1>Apply for a curated HotMess partnership.</h1>
      <p class="hero-lead">Tell us where your brand fits: events, hotels, packages, community, membership or the HotMess Guide app.</p>
    </div>
  </section>

  <section class="partner-apply-section">
    <div id="partner-apply-form">
      <?php render_inquiry_form('partner', [
          'headline' => 'Become a Partner',
          'buttonLabel' => 'Partnerbewerbung senden',
          'messagePlaceholder' => 'Tell us which audience, placement and benefit you want to create with HotMess.',
      ]); ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
