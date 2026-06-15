<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_login();

if (empty($user['email_verified_at']) && empty($user['email_verified'])) {
    redirect('/verify.php');
}

render_header('Hotmess Feed');
?>

<main class="hotmess-feed-page">
  <section class="dashboard-hero hotmess-feed-hero">
    <p class="eyebrow">Hotmess Feed</p>
    <h1>Willkommen im Hotmess Feed.</h1>
    <p>Hier beginnt dein echtes soziales Netzwerk.</p>
    <div class="hero-actions">
      <a class="button primary hotmess-gradient-button" href="/profile">Profil ansehen</a>
      <a class="button ghost" href="/chat">Chat oeffnen</a>
    </div>
  </section>

  <section class="platform-section">
    <div class="event-admin-grid">
      <article class="premium-card">
        <span>Heute</span>
        <h2>Was ist gerade echt?</h2>
        <p>Der produktive Feed ist vorbereitet. Als naechstes koennen Posts, Sichtbarkeit, Meldungen und Medien an die bestehende Account- und Storage-Struktur angeschlossen werden.</p>
      </article>
      <article class="premium-card">
        <span>Safe Space</span>
        <h2>Keine Fassade.</h2>
        <p>Hotmess bleibt ein Ort fuer echte Gedanken, echte Gefuehle und echte Momente.</p>
      </article>
    </div>
  </section>
</main>

<?php render_footer(); ?>
