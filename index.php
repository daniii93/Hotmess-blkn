<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

render_header('Hotmess - echte Gedanken, echte Gefuehle, echte Momente');
?>

<main class="hotmess-landing">
  <section class="hotmess-landing-side hotmess-landing-story">
    <a class="hotmess-wordmark" href="/">HOTMESS</a>
    <div class="hotmess-landing-copy">
      <h1>
        Teile <span>echte Gedanken</span>,<br />
        <span>echte Gefuehle</span><br />
        und <span>echte Momente</span>.
      </h1>
      <p>Hotmess ist ein Ort fuer das echte Leben. Ohne Filter. Ohne Fassade. Ohne Druck.</p>
    </div>

    <div class="hotmess-story-cards" aria-label="Echte Hotmess Momente">
      <article class="hotmess-story-card card-one"><span>02:17 Uhr.</span><strong>Kann nicht schlafen.</strong></article>
      <article class="hotmess-story-card card-two"><span>Heute war einfach</span><strong>einer dieser Tage.</strong></article>
      <article class="hotmess-story-card card-three"><span>Kein besonderer Tag.</span><strong>Trotzdem schoen.</strong></article>
      <article class="hotmess-story-card card-four"><span>Manchmal hilft</span><strong>einfach frische Luft.</strong></article>
    </div>
  </section>

  <section class="hotmess-landing-side hotmess-landing-login" aria-label="Hotmess Anmeldung">
    <section class="auth-panel hotmess-auth-card">
      <p class="eyebrow">Eigener Hotmess Account</p>
      <h2>Bei Hotmess anmelden</h2>
      <?php render_flash(); ?>
      <form class="stack-form" method="post" action="/login.php">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <label>E-Mail-Adresse oder Benutzername<input type="text" name="identifier" autocomplete="username" required /></label>
        <label>Passwort<input type="password" name="password" autocomplete="current-password" required /></label>
        <button class="button primary hotmess-gradient-button" type="submit">Anmelden</button>
      </form>
      <a class="small-link" href="/login.php?forgot=1">Passwort vergessen?</a>
      <div class="hotmess-auth-divider"></div>
      <p class="auth-switch">Du hast noch kein Konto?</p>
      <a class="button ghost hotmess-create-account" href="/signup">Konto erstellen</a>
    </section>
  </section>
</main>

<footer class="hotmess-public-footer">
  <nav aria-label="Footer">
    <a href="/legal/imprint">Ueber Hotmess</a>
    <a href="/contact">Hilfe</a>
    <a href="/legal/privacy">Sicherheit</a>
    <a href="/legal/privacy">Datenschutz</a>
    <a href="/legal/terms">Nutzungsbedingungen</a>
    <a href="/gallery">Blog</a>
    <a href="/partners/apply">Karriere</a>
  </nav>
  <span>© 2026 Hotmess</span>
</footer>
      </body>
    </html>
