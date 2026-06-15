<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_approved_member_or_admin();
hotmess_ensure_phase1_schema();

$activities = [];
try {
    $stmt = db()->prepare(
        'SELECT fa.*, COALESCE(actor.username, actor.instagram_handle, actor.name) AS actor_username, actor.name AS actor_name
         FROM hotmess_phase1_friend_activity fa
         LEFT JOIN users actor ON actor.id = fa.actor_id
         WHERE fa.user_id IS NULL OR fa.user_id = ? OR fa.visibility = "members"
         ORDER BY fa.created_at DESC
         LIMIT 40'
    );
    $stmt->execute([(int) $user['id']]);
    $activities = $stmt->fetchAll();
} catch (Throwable) {
    $activities = [];
}

render_header('Freunde | HOTMESS');
?>

<main class="hm-app-page">
  <section class="hm-app-hero">
    <p class="eyebrow">Mitgliederbereich</p>
    <h1>Freunde & Aktivität</h1>
    <p>Sieh, was in deinem HOTMESS Kreis passiert: neue Verbindungen, besuchte Events, Tickets und Momente aus dem Feed.</p>
    <div class="hm-app-actions">
      <a class="button primary" href="/feed">Feed öffnen</a>
      <a class="button ghost" href="/chat">Chat öffnen</a>
    </div>
  </section>

  <section class="hm-app-grid">
    <article class="hm-app-card">
      <span class="hm-app-kicker">Privatsphäre</span>
      <h2>Dein Kreis bleibt kontrolliert.</h2>
      <p>Die Aktivität ist für Mitglieder vorbereitet und kann später über Privacy-Regeln, Follower und Freundschaftsanfragen gesteuert werden.</p>
    </article>
    <article class="hm-app-card">
      <span class="hm-app-kicker">Kontakte</span>
      <h2>Erste Kontakte finden</h2>
      <p>Nach dem Onboarding können Mitglieder über Username, Stadt und gemeinsame Events vorgeschlagen werden.</p>
    </article>
  </section>

  <section class="hm-panel">
    <div class="section-heading">
      <p class="eyebrow">Friend Activity</p>
      <h2>Aktuelle Aktivität</h2>
    </div>
    <?php if (!$activities): ?>
      <div class="hm-empty-state">
        <h3>Noch keine Aktivität</h3>
        <p>Sobald Mitglieder Events besuchen, Profile folgen oder Feed-Beiträge teilen, erscheint die Aktivität hier.</p>
      </div>
    <?php else: ?>
      <div class="hm-list">
        <?php foreach ($activities as $activity): ?>
          <a class="hm-list-item" href="<?= e((string) ($activity['related_url'] ?: '/feed')) ?>">
            <span class="hm-list-dot"></span>
            <span>
              <strong><?= e((string) $activity['title']) ?></strong>
              <small><?= e((string) ($activity['detail'] ?? '')) ?></small>
            </span>
            <time><?= e(date('d.m.Y H:i', strtotime((string) $activity['created_at']))) ?></time>
          </a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </section>
</main>

<?php render_footer(); ?>

