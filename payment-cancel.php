<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

render_header('Payment abgebrochen');
?>

<main class="platform-page payment-result-page">
  <section class="tickets-panel">
    <p class="eyebrow">Payment</p>
    <h1>Checkout wurde abgebrochen.</h1>
    <p>Es wurde keine Zahlung abgeschlossen. Du kannst den Checkout jederzeit erneut starten.</p>
    <div class="hero-actions">
      <a class="button primary" href="/tickets">Tickets</a>
      <a class="button ghost" href="/membership">Membership</a>
      <a class="button ghost" href="/packages">Packages</a>
    </div>
  </section>
</main>

<?php render_footer(); ?>
