<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

$user = current_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthenticated']);
    exit;
}

if (hotmess_user_is_banned($user)) {
    http_response_code(403);
    echo json_encode(['error' => 'Account restricted']);
    exit;
}

mark_user_seen((int) $user['id']);

function poll_prepare_chat_schema(): void
{
    prepare_chat_moderation_schema();
    db()->exec(
        'CREATE TABLE IF NOT EXISTS chat_realtime_events (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          conversation_id INT UNSIGNED NOT NULL,
          event_type VARCHAR(80) NOT NULL,
          payload JSON NOT NULL,
          delivered_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX realtime_events_pending_idx (conversation_id, delivered_at, created_at),
          CONSTRAINT realtime_events_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
        )'
    );
}

function poll_message_status(array $message, int $currentUserId): string
{
    if ((int) $message['sender_id'] !== $currentUserId) {
        return '';
    }

    return in_array((string) ($message['message_status'] ?? ''), ['sent', 'delivered', 'seen'], true)
        ? (string) $message['message_status']
        : 'sent';
}

try {
    poll_prepare_chat_schema();
} catch (Throwable) {
    http_response_code(500);
    echo json_encode(['error' => 'Chat schema unavailable']);
    exit;
}

$conversationId = (int) ($_GET['conversation_id'] ?? 0);
$afterId = (int) ($_GET['after_id'] ?? 0);

try {
    $delivered = db()->prepare(
        'UPDATE messages
         JOIN conversation_participants cp ON cp.conversation_id = messages.conversation_id AND cp.user_id = ? AND cp.deleted_at IS NULL
         SET messages.message_status = "delivered",
             messages.delivered_at = COALESCE(messages.delivered_at, NOW())
         WHERE messages.sender_id <> ?
           AND messages.deleted_at IS NULL
           AND messages.deleted_for_all_at IS NULL
           AND messages.message_status = "sent"'
    );
    $delivered->execute([(int) $user['id'], (int) $user['id']]);
} catch (Throwable) {
}

$messages = [];
$latestMessageId = $afterId;

if ($conversationId > 0) {
    if (!conversation_belongs_to_user($conversationId, (int) $user['id'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Chat membership required']);
        exit;
    }

    $stmt = db()->prepare(
        'INSERT INTO conversation_reads (conversation_id, user_id, last_read_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE last_read_at = NOW()'
    );
    $stmt->execute([$conversationId, (int) $user['id']]);
    db()->prepare('UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?')
        ->execute([$conversationId, (int) $user['id']]);
    db()->prepare(
        'UPDATE messages
         SET message_status = "seen",
             delivered_at = COALESCE(delivered_at, NOW()),
             seen_at = COALESCE(seen_at, NOW())
         WHERE conversation_id = ?
           AND sender_id <> ?
           AND deleted_at IS NULL
           AND deleted_for_all_at IS NULL
           AND message_status IN ("sent", "delivered")'
    )->execute([$conversationId, (int) $user['id']]);

    $stmt = db()->prepare(
        'SELECT messages.id, messages.sender_id, messages.body, messages.message_type, messages.media_path,
                messages.file_size, messages.mime_type, messages.message_status, messages.created_at,
                users.name AS sender_name, users.profile_photo AS sender_photo
         FROM messages
         JOIN users ON users.id = messages.sender_id
         LEFT JOIN message_user_deletions mud ON mud.message_id = messages.id AND mud.user_id = ?
         WHERE messages.conversation_id = ?
           AND messages.id > ?
           AND messages.deleted_at IS NULL
           AND messages.deleted_for_all_at IS NULL
           AND mud.id IS NULL
           AND (messages.scheduled_at IS NULL OR messages.scheduled_at <= NOW() OR messages.sender_id = ?)
         ORDER BY messages.id ASC
         LIMIT 80'
    );
    $stmt->execute([(int) $user['id'], $conversationId, $afterId, (int) $user['id']]);
    foreach ($stmt->fetchAll() as $message) {
        $latestMessageId = max($latestMessageId, (int) $message['id']);
        $messages[] = [
            'id' => (int) $message['id'],
            'conversation_id' => $conversationId,
            'sender_id' => (int) $message['sender_id'],
            'sender_name' => (string) $message['sender_name'],
            'body' => (string) ($message['body'] ?? ''),
            'message_type' => (string) $message['message_type'],
            'media_url' => (string) ($message['media_path'] ?? ''),
            'file_size' => $message['file_size'] !== null ? (int) $message['file_size'] : null,
            'mime_type' => (string) ($message['mime_type'] ?? ''),
            'status' => poll_message_status($message, (int) $user['id']),
            'mine' => (int) $message['sender_id'] === (int) $user['id'],
            'created_at' => (string) $message['created_at'],
        ];
    }
}

$unreadStmt = db()->prepare(
    'SELECT conversations.id AS conversation_id,
            COUNT(DISTINCT CASE WHEN messages.sender_id <> ? AND messages.deleted_at IS NULL AND messages.deleted_for_all_at IS NULL AND (conversation_reads.last_read_at IS NULL OR messages.created_at > conversation_reads.last_read_at) THEN messages.id END) AS unread_count,
            MAX(messages.created_at) AS last_message_at
     FROM conversations
     JOIN conversation_participants mine ON mine.conversation_id = conversations.id AND mine.user_id = ? AND mine.deleted_at IS NULL
     LEFT JOIN messages ON messages.conversation_id = conversations.id
     LEFT JOIN conversation_reads ON conversation_reads.conversation_id = conversations.id AND conversation_reads.user_id = ?
     WHERE mine.archived_at IS NULL
     GROUP BY conversations.id'
);
$unreadStmt->execute([(int) $user['id'], (int) $user['id'], (int) $user['id']]);
$conversations = array_map(static fn (array $row): array => [
    'conversation_id' => (int) $row['conversation_id'],
    'unread_count' => (int) $row['unread_count'],
    'last_message_at' => (string) ($row['last_message_at'] ?? ''),
], $unreadStmt->fetchAll());

echo json_encode([
    'ok' => true,
    'mode' => 'polling',
    'intervalMs' => 7000,
    'latestMessageId' => $latestMessageId,
    'messages' => $messages,
    'conversations' => $conversations,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
