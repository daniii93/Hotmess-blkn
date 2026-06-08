<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_approved_member_or_admin();
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = 20;
$offset = ($page - 1) * $limit;

$stats = profile_visitor_stats((int) $user['id']);
$visitors = profile_visitors((int) $user['id'], $limit, $offset);

$countStmt = db()->prepare('SELECT COUNT(*) FROM profile_view_summary WHERE viewed_user_id = ?');
$countStmt->execute([$user['id']]);
$totalVisitors = (int) $countStmt->fetchColumn();
$totalPages = max(1, (int) ceil($totalVisitors / $limit));

$groups = [];
foreach ($visitors as $visitor) {
    $groups[profile_visit_bucket((string) $visitor['last_viewed_at'])][] = $visitor;
}

render_header('Profilbesucher');
?>

<main class="visitors-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Profilbesucher</p>
    <h1>Wer war auf deinem Profil?</h1>
    <p>Nur du kannst diese Liste sehen. Eigene Profilaufrufe werden nicht gespeichert.</p>
  </section>

  <section class="visitor-stats">
    <article>
      <span>Heute</span>
      <strong><?= e((string) $stats['views_today']) ?></strong>
      <p><?= e((string) $stats['unique_viewers_today']) ?> verschiedene Mitglieder</p>
    </article>
    <article>
      <span>Letzte 7 Tage</span>
      <strong><?= e((string) $stats['views_last_7_days']) ?></strong>
      <p><?= e((string) $stats['unique_viewers_last_7_days']) ?> verschiedene Mitglieder</p>
    </article>
    <article>
      <span>Letzte 30 Tage</span>
      <strong><?= e((string) $stats['views_last_30_days']) ?></strong>
      <p><?= e((string) $stats['unique_viewers_last_30_days']) ?> verschiedene Mitglieder</p>
    </article>
    <article>
      <span>Gesamt</span>
      <strong><?= e((string) $stats['total_views']) ?></strong>
      <p><?= e((string) $stats['total_unique_viewers']) ?> verschiedene Mitglieder</p>
    </article>
  </section>

  <section class="visitor-list">
    <?php if (!$visitors): ?>
      <article class="empty-chat">
        <h2>Noch keine Profilbesucher.</h2>
        <p>Sobald ein anderes Mitglied dein Profil öffnet, erscheint es hier.</p>
      </article>
    <?php endif; ?>

    <?php foreach ($groups as $label => $items): ?>
      <h2><?= e($label) ?></h2>
      <?php foreach ($items as $visitor): ?>
        <article class="visitor-item">
          <span class="avatar"><?= chat_avatar($visitor['profile_photo'] ?? null, (string) $visitor['name']) ?></span>
          <div class="visitor-copy">
            <div>
              <strong><?= e($visitor['name']) ?></strong>
              <span>@<?= e(ltrim((string) $visitor['instagram_handle'], '@')) ?></span>
            </div>
            <p>
              Zuletzt <?= e(date('d.m.Y H:i', strtotime((string) $visitor['last_viewed_at']))) ?>
              · <?= e((string) $visitor['total_views']) ?> <?= (int) $visitor['total_views'] === 1 ? 'Besuch' : 'Besuche' ?>
              · <?= is_user_online($visitor['last_seen_at'] ?? null) ? 'Online' : 'Offline' ?>
            </p>
          </div>
          <div class="visitor-actions">
            <a class="button ghost" href="profile.php?id=<?= e((string) $visitor['viewer_user_id']) ?>">Profil ansehen</a>
            <form method="post" action="message-member.php">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="recipient_id" value="<?= e((string) $visitor['viewer_user_id']) ?>" />
              <button class="button primary" type="submit">Nachricht senden</button>
            </form>
          </div>
        </article>
      <?php endforeach; ?>
    <?php endforeach; ?>

    <?php if ($totalPages > 1): ?>
      <nav class="pagination" aria-label="Profilbesucher Seiten">
        <?php for ($i = 1; $i <= $totalPages; $i++): ?>
          <a class="<?= $i === $page ? 'is-active' : '' ?>" href="profile-visitors.php?page=<?= e((string) $i) ?>"><?= e((string) $i) ?></a>
        <?php endfor; ?>
      </nav>
    <?php endif; ?>
  </section>
</main>

<?php render_footer(); ?>
