<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

$user = require_approved_member_or_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/chat');
}

verify_csrf();

$recipientId = (int) ($_POST['recipient_id'] ?? 0);

if ($recipientId <= 0 || $recipientId === (int) $user['id']) {
    redirect('/chat');
}

$stmt = db()->prepare('SELECT id FROM users WHERE id = ? AND status = "approved" AND role = "member" LIMIT 1');
$stmt->execute([$recipientId]);

if (!$stmt->fetchColumn()) {
    redirect('/chat');
}

$stmt = db()->prepare(
    'SELECT conversations.id
     FROM conversations
     JOIN conversation_participants a ON a.conversation_id = conversations.id AND a.user_id = ?
     JOIN conversation_participants b ON b.conversation_id = conversations.id AND b.user_id = ?
     WHERE conversations.type = "member"
       AND conversations.closed_at IS NULL
       AND (SELECT COUNT(*) FROM conversation_participants cp WHERE cp.conversation_id = conversations.id) = 2
     ORDER BY conversations.created_at DESC
     LIMIT 1'
);
$stmt->execute([$user['id'], $recipientId]);
$existingConversationId = (int) $stmt->fetchColumn();

if ($existingConversationId > 0) {
    redirect('/chat/' . $existingConversationId);
}

$stmt = db()->prepare('INSERT INTO conversations (type, retention, created_by) VALUES ("member", "24h", ?)');
$stmt->execute([$user['id']]);
$conversationId = (int) db()->lastInsertId();

$insert = db()->prepare('INSERT IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
$insert->execute([$conversationId, $user['id']]);
$insert->execute([$conversationId, $recipientId]);

redirect('/chat/' . $conversationId);
