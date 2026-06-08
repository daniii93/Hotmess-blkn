<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/email-log.php';

$admin = require_admin();
$providerStatus = getEmailProviderStatus();
$templateLabels = hotmess_email_template_labels();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $to = trim((string) ($_POST['to_email'] ?? ''));
    $templateKey = (string) ($_POST['template_key'] ?? 'welcome_member');
    if (!array_key_exists($templateKey, hotmess_email_templates())) {
        $templateKey = 'welcome_member';
    }
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        flash('Bitte gib eine gueltige Test-E-Mail-Adresse ein.');
    } else {
        $result = sendTemplateEmail($templateKey, $to, [
            'name' => 'HOTMESS Test',
            'detail' => 'Dies ist ein Admin-Testversand aus der HOTMESS E-Mail-Konsole.',
        ], [
            'trigger' => 'admin_test',
            'adminId' => (int) $admin['id'],
        ]);
        flash($result['status'] === 'sent' ? 'Test-E-Mail wurde gesendet.' : 'Test-E-Mail wurde geloggt: ' . $result['message']);
    }
    redirect('/admin/email');
}

$logs = hotmess_email_logs(80);

render_header('Admin E-Mail');
?>

<main class="admin-page enterprise-admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Admin / E-Mail Infrastruktur</p>
    <h1>HOTMESS E-Mail Control</h1>
    <p>Providerstatus, Template-Testversand und Versandlogs fuer transaktionale HOTMESS E-Mails.</p>
    <div class="admin-tab-nav">
      <a href="/admin/system">System</a>
      <a class="is-active" href="/admin/email">E-Mail</a>
      <a href="/admin/settings">Settings</a>
      <a href="/admin/inquiries">Inquiries</a>
      <a href="/admin/crm">CRM</a>
    </div>
  </section>

  <?php render_flash(); ?>

  <section class="platform-section">
    <div class="admin-kpi-grid">
      <article><span>Provider</span><strong><?= e($providerStatus['provider']) ?></strong><p><?= $providerStatus['configured'] ? 'Resend ist konfiguriert' : 'Mock-/Log-Modus aktiv' ?></p></article>
      <article><span>From Email</span><strong><?= e($providerStatus['fromEmail']) ?></strong><p>Keine API Keys sichtbar</p></article>
      <article><span>Reply-To</span><strong><?= e($providerStatus['replyToEmail']) ?></strong><p>Antwortadresse</p></article>
      <article><span>Postmark</span><strong><?= $providerStatus['postmarkPrepared'] ? 'vorbereitet' : 'optional' ?></strong><p>Alternative Provider-Schicht</p></article>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Testversand</p>
      <h2>Template testen.</h2>
      <p>Wenn `RESEND_API_KEY` fehlt, wird der Test sauber als Log gespeichert und nicht versendet.</p>
    </div>
    <form class="event-editor-form" method="post">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
      <label>Test-E-Mail-Adresse<input type="email" name="to_email" placeholder="tech@hotmess-blkn.com" required /></label>
      <label>Template
        <select name="template_key">
          <?php foreach ($templateLabels as $templateKey => $label): ?>
            <option value="<?= e($templateKey) ?>"><?= e($label) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <button class="button primary" type="submit">Test-E-Mail senden</button>
    </form>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Email Logs</p>
      <h2>Letzte Versandversuche.</h2>
    </div>
    <div class="table-wrap">
      <table class="admin-lux-table">
        <thead><tr><th>Zeit</th><th>Empfaenger</th><th>Template</th><th>Betreff</th><th>Status</th><th>Provider</th><th>Fehler</th></tr></thead>
        <tbody>
          <?php foreach ($logs as $log): ?>
            <tr>
              <td><?= e((string) $log['created_at']) ?></td>
              <td><?= e((string) $log['to_email']) ?></td>
              <td><?= e((string) ($log['template_key'] ?? '')) ?></td>
              <td><strong><?= e((string) $log['subject']) ?></strong><span><?= e((string) ($log['provider_message_id'] ?? '')) ?></span></td>
              <td><?= e(hotmess_email_status_label((string) $log['status'])) ?></td>
              <td><?= e((string) $log['provider']) ?></td>
              <td><?= e((string) ($log['error_message'] ?? '')) ?></td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$logs): ?>
            <tr><td colspan="7">Noch keine E-Mail-Logs vorhanden.</td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </section>
</main>

<?php render_footer(); ?>
