<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$user = current_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthenticated']);
    exit;
}

mark_user_seen((int) $user['id']);

function prepare_screenshot_event_schema(): void
{
    db()->exec('ALTER TABLE messages MODIFY COLUMN message_type ENUM("text", "image", "video", "audio", "file", "system") NOT NULL DEFAULT "text"');
    db()->exec(
        'CREATE TABLE IF NOT EXISTS chat_screenshot_events (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          conversation_id INT UNSIGNED NOT NULL,
          user_id INT UNSIGNED NOT NULL,
          message_id INT UNSIGNED NULL,
          content_id VARCHAR(120) NOT NULL,
          client_event_id VARCHAR(120) NOT NULL,
          captured_at DATETIME NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY screenshot_events_client_unique (client_event_id),
          UNIQUE KEY screenshot_events_dedupe_unique (conversation_id, user_id, content_id, captured_at),
          INDEX screenshot_events_chat_idx (conversation_id, created_at),
          CONSTRAINT screenshot_events_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
          CONSTRAINT screenshot_events_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          CONSTRAINT screenshot_events_message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
        )'
    );
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

function request_json_payload(): array
{
    $raw = file_get_contents('php://input') ?: '';
    $payload = json_decode($raw, true);

    if (is_array($payload)) {
        return $payload;
    }

    return $_POST;
}

function normalize_captured_at(mixed $value): string
{
    if (is_string($value) && trim($value) !== '') {
        try {
            return (new DateTimeImmutable($value))->format('Y-m-d H:i:s');
        } catch (Throwable) {
            // Fall through to current server time.
        }
    }

    return (new DateTimeImmutable())->format('Y-m-d H:i:s');
}

try {
    prepare_screenshot_event_schema();
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['error' => 'Screenshot event schema unavailable']);
    exit;
}

$payload = request_json_payload();
$conversationId = (int) ($payload['conversation_id'] ?? $payload['chat_id'] ?? 0);
$contentId = trim((string) ($payload['content_id'] ?? ''));
$capturedAt = normalize_captured_at($payload['captured_at'] ?? $payload['timestamp'] ?? null);

if ($conversationId <= 0 || $contentId === '') {
    http_response_code(422);
    echo json_encode(['error' => 'conversation_id and content_id are required']);
    exit;
}

if (!conversation_belongs_to_user($conversationId, (int) $user['id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Chat membership required']);
    exit;
}

$contentId = substr($contentId, 0, 120);
$clientEventId = trim((string) ($payload['client_event_id'] ?? ''));
if ($clientEventId === '') {
    $clientEventId = hash('sha256', implode('|', [$conversationId, $user['id'], $contentId, $capturedAt]));
}
$clientEventId = substr($clientEventId, 0, 120);

$displayName = trim((string) ($user['name'] ?? 'HOTMESS Mitglied'));
if ($displayName === '') {
    $displayName = 'HOTMESS Mitglied';
}
$systemBody = $displayName . ' hat einen Screenshot gemacht.';

try {
    db()->beginTransaction();

    $insertEvent = db()->prepare(
        'INSERT INTO chat_screenshot_events (conversation_id, user_id, content_id, client_event_id, captured_at)
         VALUES (?, ?, ?, ?, ?)'
    );
    $insertEvent->execute([$conversationId, (int) $user['id'], $contentId, $clientEventId, $capturedAt]);
    $eventId = (int) db()->lastInsertId();

    $insertMessage = db()->prepare(
        'INSERT INTO messages (conversation_id, sender_id, body, message_type, message_status, delivered_at, seen_at)
         VALUES (?, ?, ?, "system", "seen", NOW(), NOW())'
    );
    $insertMessage->execute([$conversationId, (int) $user['id'], $systemBody]);
    $messageId = (int) db()->lastInsertId();

    $updateEvent = db()->prepare('UPDATE chat_screenshot_events SET message_id = ? WHERE id = ?');
    $updateEvent->execute([$messageId, $eventId]);

    $realtimePayload = [
        'type' => 'chat.screenshot_taken',
        'conversation_id' => $conversationId,
        'content_id' => $contentId,
        'user_id' => (int) $user['id'],
        'name' => $displayName,
        'message_id' => $messageId,
        'body' => $systemBody,
        'captured_at' => $capturedAt,
    ];
    $queueRealtime = db()->prepare(
        'INSERT INTO chat_realtime_events (conversation_id, event_type, payload)
         VALUES (?, "chat.screenshot_taken", ?)'
    );
    $queueRealtime->execute([$conversationId, json_encode($realtimePayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);

    $restore = db()->prepare('UPDATE conversation_participants SET archived_at = NULL, deleted_at = NULL WHERE conversation_id = ?');
    $restore->execute([$conversationId]);

    db()->commit();

    echo json_encode([
        'ok' => true,
        'duplicate' => false,
        'event' => [
            'id' => $eventId,
            'type' => 'chat.screenshot_taken',
            'conversation_id' => $conversationId,
            'content_id' => $contentId,
            'user_id' => (int) $user['id'],
            'name' => $displayName,
            'message_id' => $messageId,
            'captured_at' => $capturedAt,
            'body' => $systemBody,
        ],
        'websocket_event' => $realtimePayload,
    ]);
} catch (PDOException $error) {
    if (db()->inTransaction()) {
        db()->rollBack();
    }

    if (($error->errorInfo[1] ?? null) === 1062) {
        echo json_encode(['ok' => true, 'duplicate' => true]);
        exit;
    }

    http_response_code(500);
    echo json_encode(['error' => 'Screenshot event could not be stored']);
}
