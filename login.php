<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

hotmess_ensure_auth_schema();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $identifier = strtolower(trim($_POST['identifier'] ?? $_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    $stmt = db()->prepare('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1');
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = (int) $user['id'];
        $_SESSION['user_role'] = (string) ($user['role'] ?? 'member');
        hotmess_track(ANALYTICS_LOGIN, ['role' => $user['role'] ?? 'member'], (int) $user['id']);
        if (($user['role'] ?? '') === 'admin') {
            redirect('/admin');
        }
        if (empty($user['email_verified_at']) && empty($user['email_verified'])) {
            redirect('/verify.php');
        }
        if ((int) ($user['onboarding_step'] ?? 0) < 3) {
            redirect('/onboarding');
        }
        redirect('/feed');
    }

    flash('Anmeldung nicht gefunden. Bitte pruefe Benutzername/E-Mail und Passwort.');
}

render_header('Bei Hotmess anmelden');
?>

<main class="auth-page hotmess-auth-page">
  <section class="auth-panel hotmess-auth-card">
    <p class="eyebrow">Hotmess Account</p>
    <h1>Bei Hotmess anmelden</h1>
    <?php render_flash(); ?>
    <form class="stack-form" method="post">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
      <label>E-Mail-Adresse oder Benutzername<input type="text" name="identifier" autocomplete="username" required /></label>
      <label>Passwort<input type="password" name="password" required /></label>
      <button class="button primary hotmess-gradient-button" type="submit">Anmelden</button>
    </form>
    <a class="small-link" href="/login.php?forgot=1">Passwort vergessen?</a>
    <p class="auth-switch">Du hast noch kein Konto?</p>
    <a class="button ghost" href="/signup">Konto erstellen</a>
  </section>
</main>

<?php render_footer(); ?>
