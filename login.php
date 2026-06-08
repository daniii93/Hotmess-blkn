<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    $stmt = db()->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = (int) $user['id'];
        if (($user['role'] ?? '') === 'admin') {
            redirect('/admin');
        }
        redirect('dashboard.php');
    }

    flash('Login nicht gefunden.');
}

render_header('Login');
?>

<main class="auth-page">
  <section class="auth-panel">
    <p class="eyebrow">Member access</p>
    <h1>Login</h1>
    <?php render_flash(); ?>
    <form class="stack-form" method="post">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
      <label>E-Mail<input type="email" name="email" required /></label>
      <label>Passwort<input type="password" name="password" required /></label>
      <button class="button primary" type="submit">Einloggen</button>
    </form>
    <p class="auth-switch">Noch kein Account? <a href="register.php">Registrieren</a></p>
  </section>
</main>

<?php render_footer(); ?>
