<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

require_admin();
cleanup_expired_messages();

$conversations = db()->query(
    'SELECT conversations.id,
      conversations.type,
      conversations.retention,
      conversations.created_by,
      conversations.closed_at,
      conversations.created_at,
      users.name AS member_name,
      users.email AS member_email,
      MAX(messages.created_at) AS last_message_at
     FROM conversations
     JOIN conversation_participants cp ON cp.conversation_id = conversations.id
     JOIN users ON users.id = cp.user_id AND users.role = "member"
     LEFT JOIN messages ON messages.conversation_id = conversations.id AND messages.deleted_at IS NULL
     WHERE conversations.type = "organizer"
     GROUP BY conversations.id, conversations.type, conversations.retention, conversations.created_by, conversations.closed_at, conversations.created_at, users.name, users.email
     ORDER BY COALESCE(MAX(messages.created_at), conversations.created_at) DESC'
)->fetchAll();

render_header('Veranstalter-Nachrichten');
?>

<main class="admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Inbox</p>
    <h1>Nachrichten an Veranstalter</h1>
    <p>Diese Nachrichten werden bis zu 1 Jahr gespeichert.</p>
  </section>
  <section class="member-table-wrap">
    <table class="member-table">
      <thead>
        <tr>
          <th>Mitglied</th>
          <th>E-Mail</th>
          <th>Letzte Nachricht</th>
          <th>Chat</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($conversations as $conversation): ?>
          <tr>
            <td><?= e($conversation['member_name']) ?></td>
            <td><?= e($conversation['member_email']) ?></td>
            <td><?= e($conversation['last_message_at'] ? date('d.m.Y H:i', strtotime((string) $conversation['last_message_at'])) : '-') ?></td>
            <td><a class="small-link" href="chat.php?conversation=<?= e((string) $conversation['id']) ?>">Öffnen</a></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </section>
</main>

<?php render_footer(); ?>
