<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

hotmess_ensure_auth_schema();

$user = require_login();

if (($user['role'] ?? '') === 'admin') {
    redirect('/admin');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $action = (string) ($_POST['action'] ?? 'verify');

    if ($action === 'resend') {
        try {
            generate_verification_code($user, 'email');
            flash('Neuer E-Mail-Code wurde gesendet.');
        } catch (RuntimeException $exception) {
            flash($exception->getMessage());
        }
        redirect('/verify.php');
    }

    [$ok, $message] = verify_code($user, 'email', trim((string) ($_POST['code'] ?? '')));
    flash($message);

    if ($ok) {
        try {
            db()->prepare('UPDATE users SET email_verified = 1 WHERE id = ?')->execute([(int) $user['id']]);
        } catch (Throwable) {
        }
        redirect('/onboarding');
    }

    redirect('/verify.php');
}

render_header('E-Mail bestaetigen');
?>

<main class="auth-page hotmess-auth-page">
  <section class="auth-panel hotmess-auth-card">
    <p class="eyebrow">Hotmess Verifizierung</p>
    <h1>E-Mail bestaetigen</h1>
    <p>Wir haben einen 6-stelligen Code an <?= e((string) $user['email']) ?> gesendet.</p>
    <?php render_flash(); ?>

    <div class="verification-list">
      <article>
        <h3>E-Mail-Adresse</h3>
        <p><?= is_verified($user, 'email') ? 'Bestaetigt' : 'Bitte bestaetige deine E-Mail, bevor du dein Profil einrichtest.' ?></p>
        <?php if (!is_verified($user, 'email')): ?>
          <form class="stack-form" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="action" value="verify" />
            <label>6-stelliger Code<input type="text" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required /></label>
            <button class="button primary hotmess-gradient-button" type="submit">E-Mail bestaetigen</button>
          </form>
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="action" value="resend" />
            <button class="link-button" type="submit">Neuen Code senden</button>
          </form>
        <?php else: ?>
          <a class="button primary" href="/onboarding">Weiter zum Onboarding</a>
        <?php endif; ?>
      </article>
    </div>
  </section>
</main>

<?php render_footer(); ?>
