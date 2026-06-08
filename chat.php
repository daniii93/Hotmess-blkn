<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_approved_member_or_admin();
cleanup_expired_messages();
$userChatRestriction = hotmess_user_chat_restriction($user);

function chat_prepare_schema(): bool
{
    try {
        prepare_chat_moderation_schema();
        $stmt = db()->prepare(
            'SELECT COLUMN_NAME
             FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME IN ("pinned", "muted", "blocked", "reply_to_message_id", "media_visibility", "message_status", "edited_at", "scheduled_at", "delivered_at", "seen_at", "file_size", "mime_type")'
        );
        $stmt->execute(['conversation_participants']);
        $participantColumns = array_column($stmt->fetchAll(), 'COLUMN_NAME');

        if (!in_array('pinned', $participantColumns, true)) {
            db()->exec('ALTER TABLE conversation_participants ADD COLUMN pinned TINYINT(1) NOT NULL DEFAULT 0 AFTER last_read_at');
        }

        if (!in_array('muted', $participantColumns, true)) {
            db()->exec('ALTER TABLE conversation_participants ADD COLUMN muted TINYINT(1) NOT NULL DEFAULT 0 AFTER pinned');
        }

        if (!in_array('blocked', $participantColumns, true)) {
            db()->exec('ALTER TABLE conversation_participants ADD COLUMN blocked TINYINT(1) NOT NULL DEFAULT 0 AFTER muted');
        }

        $stmt->execute(['messages']);
        $messageColumns = array_column($stmt->fetchAll(), 'COLUMN_NAME');

        if (!in_array('reply_to_message_id', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN reply_to_message_id INT UNSIGNED NULL AFTER sender_id');
        }

        if (!in_array('media_visibility', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN media_visibility ENUM("keep", "once", "replay") NOT NULL DEFAULT "keep" AFTER media_path');
        }

        if (!in_array('file_size', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN file_size INT UNSIGNED NULL AFTER media_path');
        }

        if (!in_array('mime_type', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN mime_type VARCHAR(120) NULL AFTER file_size');
        }

        if (!in_array('edited_at', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN edited_at DATETIME NULL AFTER saved_at');
        }

        if (!in_array('scheduled_at', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN scheduled_at DATETIME NULL AFTER edited_at');
        }

        if (!in_array('delivered_at', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN delivered_at DATETIME NULL AFTER scheduled_at');
        }

        if (!in_array('seen_at', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN seen_at DATETIME NULL AFTER delivered_at');
        }

        if (!in_array('message_status', $messageColumns, true)) {
            db()->exec('ALTER TABLE messages ADD COLUMN message_status ENUM("sent", "delivered", "seen") NOT NULL DEFAULT "sent" AFTER media_visibility');
            db()->exec(
                'UPDATE messages
                 SET message_status = CASE
                   WHEN seen_at IS NOT NULL THEN "seen"
                   WHEN delivered_at IS NOT NULL THEN "delivered"
                   ELSE "sent"
                 END'
            );
        }

        db()->exec('ALTER TABLE messages MODIFY COLUMN message_type ENUM("text", "image", "video", "audio", "file", "system") NOT NULL DEFAULT "text"');

        db()->exec(
            'CREATE TABLE IF NOT EXISTS chat_message_reactions (
              id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
              message_id INT UNSIGNED NOT NULL,
              user_id INT UNSIGNED NOT NULL,
              emoji VARCHAR(16) NOT NULL,
              created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              UNIQUE KEY chat_message_reactions_unique (message_id, user_id),
              INDEX chat_message_reactions_message_idx (message_id),
              CONSTRAINT chat_message_reactions_message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
              CONSTRAINT chat_message_reactions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )'
        );

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

        return true;
    } catch (Throwable) {
        return false;
    }
}

function chat_href(int $conversationId): string
{
    return '/chat/' . $conversationId;
}

function chat_find_direct_conversation(int $userId, int $otherUserId, string $type = 'member'): int
{
    $stmt = db()->prepare(
        'SELECT conversations.id
         FROM conversations
         JOIN conversation_participants me ON me.conversation_id = conversations.id AND me.user_id = ?
         JOIN conversation_participants other_user ON other_user.conversation_id = conversations.id AND other_user.user_id = ?
         WHERE conversations.type = ?
         ORDER BY conversations.created_at DESC
         LIMIT 1'
    );
    $stmt->execute([$userId, $otherUserId, $type]);

    return (int) $stmt->fetchColumn();
}

function chat_restore_for_participants(int $conversationId, int $userId, int $otherUserId): void
{
    $stmt = db()->prepare('UPDATE conversation_participants SET archived_at = NULL, deleted_at = NULL WHERE conversation_id = ? AND user_id IN (?, ?)');
    $stmt->execute([$conversationId, $userId, $otherUserId]);
}

function chat_unique_conversations(array $conversations): array
{
    $seen = [];
    $unique = [];

    foreach ($conversations as $conversation) {
        $memberId = (string) ($conversation['member_id'] ?? $conversation['member_email'] ?? $conversation['member_name'] ?? $conversation['id']);
        $key = (string) ($conversation['type'] ?? 'member') . ':' . $memberId;

        if (isset($seen[$key])) {
            continue;
        }

        $seen[$key] = true;
        $unique[] = $conversation;
    }

    return $unique;
}

function chat_username(?string $email, string $name): string
{
    $base = trim((string) preg_replace('/@.+$/', '', (string) $email));
    if ($base === '') {
        $base = strtolower((string) preg_replace('/[^a-z0-9]+/i', '.', $name));
    }

    return '@' . trim($base, '.-_');
}

function chat_member_tier(array $member): string
{
    if (($member['role'] ?? '') === 'admin') {
        return 'concierge';
    }

    if (!empty($member['partner_id'])) {
        return 'partner';
    }

    return 'free';
}

function chat_member_tier_label(string $tier): string
{
    return match ($tier) {
        'plus' => 'Passport Plus',
        'black' => 'Passport Black',
        'ambassador' => 'Ambassador',
        'concierge' => 'Concierge',
        'partner' => 'Partnerkontakt',
        default => 'Free Passport',
    };
}

function chat_member_tier_class(string $tier): string
{
    return preg_replace('/[^a-z0-9-]/', '', strtolower($tier)) ?: 'free';
}

function chat_conversation_type_label(string $type, string $tier): string
{
    if ($type === 'organizer' || $tier === 'concierge') {
        return 'Direktchat Concierge';
    }

    if ($tier === 'partner') {
        return 'Direktchat Partnerkontakt';
    }

    return 'Mitglieder-Chat';
}

function chat_short_preview(string $preview, int $length = 58): string
{
    if (function_exists('mb_strlen') && function_exists('mb_substr')) {
        return mb_strlen($preview) > $length ? mb_substr($preview, 0, $length - 1) . '…' : $preview;
    }

    return strlen($preview) > $length ? substr($preview, 0, $length - 3) . '...' : $preview;
}

function chat_set_flag_for_user(int $conversationId, int $userId, string $flag, bool $enabled): bool
{
    if (!in_array($flag, ['pinned', 'muted'], true) || !conversation_belongs_to_user($conversationId, $userId)) {
        return false;
    }

    if ($flag === 'pinned' && $enabled) {
        $stmt = db()->prepare('SELECT COUNT(*) FROM conversation_participants WHERE user_id = ? AND pinned = 1 AND deleted_at IS NULL AND conversation_id <> ?');
        $stmt->execute([$userId, $conversationId]);
        if ((int) $stmt->fetchColumn() >= 5) {
            $_SESSION['flash'] = 'Du kannst maximal 5 Chats fixieren.';
            return false;
        }
    }

    $stmt = db()->prepare("UPDATE conversation_participants SET {$flag} = ? WHERE conversation_id = ? AND user_id = ?");
    $stmt->execute([$enabled ? 1 : 0, $conversationId, $userId]);

    return true;
}

function chat_mark_read_for_user(int $conversationId, int $userId): void
{
    $stmt = db()->prepare(
        'INSERT INTO conversation_reads (conversation_id, user_id, last_read_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE last_read_at = NOW()'
    );
    $stmt->execute([$conversationId, $userId]);

    $stmt = db()->prepare('UPDATE conversation_participants SET last_read_at = NOW() WHERE conversation_id = ? AND user_id = ?');
    $stmt->execute([$conversationId, $userId]);

    try {
        $stmt = db()->prepare(
            'UPDATE messages
             SET message_status = "seen",
                 delivered_at = COALESCE(delivered_at, NOW()),
                 seen_at = COALESCE(seen_at, NOW())
             WHERE conversation_id = ?
               AND sender_id <> ?
               AND deleted_at IS NULL
               AND deleted_for_all_at IS NULL
               AND message_status IN ("sent", "delivered")'
        );
        $stmt->execute([$conversationId, $userId]);
    } catch (Throwable) {
        // Older installs can still render while the status schema is being prepared.
    }
}

function chat_mark_delivered_for_user(int $userId): void
{
    try {
        $stmt = db()->prepare(
            'UPDATE messages
             JOIN conversation_participants cp ON cp.conversation_id = messages.conversation_id AND cp.user_id = ? AND cp.deleted_at IS NULL
             SET messages.message_status = "delivered",
                 messages.delivered_at = COALESCE(messages.delivered_at, NOW())
             WHERE messages.sender_id <> ?
               AND messages.deleted_at IS NULL
               AND messages.deleted_for_all_at IS NULL
               AND messages.message_status = "sent"'
        );
        $stmt->execute([$userId, $userId]);
    } catch (Throwable) {
        // Status delivery is progressive; rendering should not fail on older schemas.
    }
}

function chat_message_status_key(array $message, array $participants, int $currentUserId): string
{
    if ((int) $message['sender_id'] !== $currentUserId) {
        return '';
    }

    $storedStatus = (string) ($message['message_status'] ?? '');
    if (in_array($storedStatus, ['sent', 'delivered', 'seen'], true)) {
        return $storedStatus;
    }

    foreach ($participants as $participant) {
        if ((int) $participant['id'] !== $currentUserId && !empty($participant['last_read_at']) && strtotime((string) $participant['last_read_at']) >= strtotime((string) $message['created_at'])) {
            return 'seen';
        }
    }

    return !empty($message['delivered_at']) ? 'delivered' : 'sent';
}

function chat_message_status_label(string $status): string
{
    return match ($status) {
        'seen' => 'Gesehen',
        'delivered' => 'Zugestellt',
        'sent' => 'Gesendet',
        default => '',
    };
}

function chat_media_visibility_label(string $visibility): string
{
    return match ($visibility) {
        'once' => 'Einmal ansehen',
        'replay' => 'Wiederholung erlauben',
        default => 'Im Chat behalten',
    };
}

$chatFlagsReady = chat_prepare_schema();
chat_mark_delivered_for_user((int) $user['id']);
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $action = (string) ($_POST['action'] ?? '');

    try {
        if ($action === 'start_member') {
            $recipientId = (int) ($_POST['recipient_id'] ?? 0);
            $retention = ($_POST['retention'] ?? '') === 'close' ? 'close' : '24h';

            if ($recipientId > 0 && $recipientId !== (int) $user['id']) {
                $stmt = db()->prepare('SELECT id FROM users WHERE id = ? AND status = "approved" AND role = "member" LIMIT 1');
                $stmt->execute([$recipientId]);
                $validRecipientId = (int) $stmt->fetchColumn();

                if ($validRecipientId > 0) {
                    $conversationId = chat_find_direct_conversation((int) $user['id'], $validRecipientId, 'member');

                    if ($conversationId === 0) {
                        $stmt = db()->prepare('INSERT INTO conversations (type, retention, title, created_by) VALUES ("member", ?, NULL, ?)');
                        $stmt->execute([$retention, $user['id']]);
                        $conversationId = (int) db()->lastInsertId();

                        $insert = db()->prepare('INSERT IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
                        $insert->execute([$conversationId, $user['id']]);
                        $insert->execute([$conversationId, $validRecipientId]);
                    } else {
                        chat_restore_for_participants($conversationId, (int) $user['id'], $validRecipientId);
                    }

                    redirect(chat_href($conversationId));
                }
            }
        }

        if ($action === 'start_concierge') {
            $adminId = (int) db()->query('SELECT id FROM users WHERE role = "admin" ORDER BY id ASC LIMIT 1')->fetchColumn();
            $conversationId = $adminId > 0 ? chat_find_direct_conversation((int) $user['id'], $adminId, 'organizer') : 0;

            if ($conversationId === 0) {
                $stmt = db()->prepare('INSERT INTO conversations (type, retention, title, created_by) VALUES ("organizer", "1y", "HOTMESS Concierge", ?)');
                $stmt->execute([$user['id']]);
                $conversationId = (int) db()->lastInsertId();

                $insert = db()->prepare('INSERT IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
                $insert->execute([$conversationId, $user['id']]);
                if ($adminId > 0) {
                    $insert->execute([$conversationId, $adminId]);
                }
            } elseif ($adminId > 0) {
                chat_restore_for_participants($conversationId, (int) $user['id'], $adminId);
            } elseif ($conversationId > 0) {
                $stmt = db()->prepare('UPDATE conversation_participants SET archived_at = NULL, deleted_at = NULL WHERE conversation_id = ? AND user_id = ?');
                $stmt->execute([$conversationId, (int) $user['id']]);
            }

            if ($adminId > 0 && $conversationId > 0) {
                $insert = db()->prepare('INSERT IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
                $insert->execute([$conversationId, $adminId]);
            }

            redirect(chat_href($conversationId));
        }

        if ($action === 'send') {
            $conversationId = (int) ($_POST['conversation_id'] ?? 0);
            $body = trim((string) ($_POST['body'] ?? ''));
            $replyToMessageId = (int) ($_POST['reply_to_message_id'] ?? 0);
            $mediaVisibility = in_array(($_POST['media_visibility'] ?? 'keep'), ['keep', 'once', 'replay'], true) ? (string) $_POST['media_visibility'] : 'keep';
            $scheduledAtInput = trim((string) ($_POST['scheduled_at'] ?? ''));
            $scheduledAt = null;
            if ($scheduledAtInput !== '') {
                $scheduledTimestamp = strtotime($scheduledAtInput);
                if ($scheduledTimestamp && $scheduledTimestamp > time()) {
                    $scheduledAt = date('Y-m-d H:i:s', $scheduledTimestamp);
                }
            }

            if ($conversationId && conversation_belongs_to_user($conversationId, (int) $user['id'])) {
                $blockedCheck = db()->prepare('SELECT blocked FROM conversation_participants WHERE conversation_id = ? AND user_id = ? LIMIT 1');
                $blockedCheck->execute([$conversationId, (int) $user['id']]);
                $blockState = chat_conversation_block_state($conversationId, (int) $user['id']);
                if (!$userChatRestriction['allowed'] || (int) $blockedCheck->fetchColumn() === 1 || $blockState['blockedByMe'] || $blockState['blockedMe']) {
                    $_SESSION['flash'] = $blockState['blockedByMe']
                        ? 'Du hast dieses Mitglied blockiert. Hebe die Blockierung auf, bevor du wieder schreibst.'
                        : ($userChatRestriction['message'] ?: 'Dieser Chat ist fuer weitere Beitraege gesperrt.');
                    redirect(chat_href($conversationId));
                }

                [$messageType, $mediaPath, $fileSize, $mimeType] = ['text', null, null, null];
                foreach (['media_camera', 'media_gallery', 'media_audio'] as $mediaField) {
                    if (isset($_FILES[$mediaField]) && ($_FILES[$mediaField]['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                        [$messageType, $mediaPath, $fileSize, $mimeType] = handle_chat_media_upload($_FILES[$mediaField]);
                        break;
                    }
                }

                if ($body !== '' || $mediaPath !== null) {
                    $stmt = db()->prepare('SELECT retention FROM conversations WHERE id = ? LIMIT 1');
                    $stmt->execute([$conversationId]);
                    $retention = (string) $stmt->fetchColumn();
                    $expiresSql = chat_expiry_sql($retention);
                    $replyToSql = 'NULL';
                    if ($replyToMessageId > 0) {
                        $checkReply = db()->prepare('SELECT id FROM messages WHERE id = ? AND conversation_id = ? AND deleted_at IS NULL LIMIT 1');
                        $checkReply->execute([$replyToMessageId, $conversationId]);
                        if ($checkReply->fetchColumn()) {
                            $replyToSql = (string) $replyToMessageId;
                        }
                    }
                    $stmt = db()->prepare("INSERT INTO messages (conversation_id, sender_id, reply_to_message_id, body, message_type, media_path, file_size, mime_type, media_visibility, message_status, scheduled_at, expires_at) VALUES (?, ?, {$replyToSql}, ?, ?, ?, ?, ?, ?, \"sent\", ?, {$expiresSql})");
                    $stmt->execute([$conversationId, $user['id'], $body, $messageType, $mediaPath, $fileSize, $mimeType, $mediaVisibility, $scheduledAt]);
                    $messageId = (int) db()->lastInsertId();
                    db()->prepare(
                        'INSERT INTO chat_realtime_events (conversation_id, event_type, payload)
                         VALUES (?, "chat.message_created", ?)'
                    )->execute([$conversationId, json_encode([
                        'type' => 'chat.message_created',
                        'conversation_id' => $conversationId,
                        'message_id' => $messageId,
                        'sender_id' => (int) $user['id'],
                        'body' => $body,
                        'message_type' => $messageType,
                        'media_url' => $mediaPath,
                        'file_size' => $fileSize,
                        'mime_type' => $mimeType,
                        'created_at' => date('Y-m-d H:i:s'),
                    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
                    $stmt = db()->prepare('UPDATE conversation_participants SET archived_at = NULL, deleted_at = NULL WHERE conversation_id = ?');
                    $stmt->execute([$conversationId]);
                    chat_mark_read_for_user($conversationId, (int) $user['id']);
                }
            }

            redirect(chat_href($conversationId));
        }

        if (in_array($action, ['delete_message_for_me', 'delete_message_for_all', 'save_message', 'edit_message', 'react_message', 'forward_message', 'translate_message'], true)) {
            $messageId = (int) ($_POST['message_id'] ?? 0);
            $conversationId = (int) ($_POST['conversation_id'] ?? 0);

            if ($messageId && $conversationId && conversation_belongs_to_user($conversationId, (int) $user['id'])) {
                if ($action === 'delete_message_for_me') {
                    delete_message_for_user($messageId, (int) $user['id']);
                } elseif ($action === 'delete_message_for_all') {
                    delete_message_for_all($messageId, (int) $user['id']);
                } elseif ($action === 'save_message') {
                    $stmt = db()->prepare('UPDATE messages SET saved_at = NOW() WHERE id = ? AND conversation_id = ?');
                    $stmt->execute([$messageId, $conversationId]);
                } elseif ($action === 'edit_message') {
                    $editedBody = trim((string) ($_POST['edited_body'] ?? ''));
                    if ($editedBody !== '') {
                        $stmt = db()->prepare('UPDATE messages SET body = ?, edited_at = NOW() WHERE id = ? AND conversation_id = ? AND sender_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE) AND deleted_for_all_at IS NULL');
                        $stmt->execute([$editedBody, $messageId, $conversationId, $user['id']]);
                    }
                } elseif ($action === 'react_message') {
                    $emoji = (string) ($_POST['emoji'] ?? '❤️');
                    if (!in_array($emoji, ['❤️', '👍', '😂', '🔥', '😍', '👏'], true)) {
                        $emoji = '❤️';
                    }
                    $stmt = db()->prepare('INSERT INTO chat_message_reactions (message_id, user_id, emoji) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE emoji = VALUES(emoji), updated_at = NOW()');
                    $stmt->execute([$messageId, $user['id'], $emoji]);
                } elseif ($action === 'forward_message') {
                    $recipientId = (int) ($_POST['forward_recipient_id'] ?? 0);
                    if ($recipientId > 0 && $recipientId !== (int) $user['id']) {
                        $stmt = db()->prepare('SELECT id FROM users WHERE id = ? AND status = "approved" AND role = "member" LIMIT 1');
                        $stmt->execute([$recipientId]);
                        if ($stmt->fetchColumn()) {
                            $stmt = db()->prepare('SELECT body, message_type, media_path, media_visibility FROM messages WHERE id = ? AND conversation_id = ? AND deleted_at IS NULL AND deleted_for_all_at IS NULL LIMIT 1');
                            $stmt->execute([$messageId, $conversationId]);
                            $sourceMessage = $stmt->fetch();
                            if ($sourceMessage) {
                                $newConversationId = chat_find_direct_conversation((int) $user['id'], $recipientId, 'member');
                                if ($newConversationId === 0) {
                                    $stmt = db()->prepare('INSERT INTO conversations (type, retention, title, created_by) VALUES ("member", "24h", NULL, ?)');
                                    $stmt->execute([$user['id']]);
                                    $newConversationId = (int) db()->lastInsertId();
                                    $insert = db()->prepare('INSERT IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)');
                                    $insert->execute([$newConversationId, $user['id']]);
                                    $insert->execute([$newConversationId, $recipientId]);
                                } else {
                                    chat_restore_for_participants($newConversationId, (int) $user['id'], $recipientId);
                                }
                                $stmt = db()->prepare('INSERT INTO messages (conversation_id, sender_id, body, message_type, media_path, media_visibility, message_status, expires_at) VALUES (?, ?, ?, ?, ?, ?, "sent", DATE_ADD(NOW(), INTERVAL 24 HOUR))');
                                $stmt->execute([$newConversationId, $user['id'], 'Weitergeleitet: ' . trim((string) ($sourceMessage['body'] ?? '')), $sourceMessage['message_type'], $sourceMessage['media_path'], $sourceMessage['media_visibility']]);
                                redirect(chat_href($newConversationId));
                            }
                        }
                    }
                } elseif ($action === 'translate_message') {
                    $_SESSION['flash'] = 'Übersetzung ist vorbereitet. Die echte Übersetzungs-API kann später angeschlossen werden.';
                }
            }

            redirect(chat_href($conversationId));
        }

        if (in_array($action, ['mark_read', 'pin_conversation', 'unpin_conversation', 'mute_conversation', 'unmute_conversation', 'archive_conversation', 'restore_conversation', 'delete_conversation', 'report_conversation', 'block_member', 'unblock_member'], true)) {
            $conversationId = (int) ($_POST['conversation_id'] ?? 0);

            if ($conversationId && conversation_belongs_to_user($conversationId, (int) $user['id'])) {
                if ($action === 'mark_read') {
                    chat_mark_read_for_user($conversationId, (int) $user['id']);
                } elseif ($action === 'pin_conversation' && $chatFlagsReady) {
                    chat_set_flag_for_user($conversationId, (int) $user['id'], 'pinned', true);
                } elseif ($action === 'unpin_conversation' && $chatFlagsReady) {
                    chat_set_flag_for_user($conversationId, (int) $user['id'], 'pinned', false);
                } elseif ($action === 'mute_conversation' && $chatFlagsReady) {
                    chat_set_flag_for_user($conversationId, (int) $user['id'], 'muted', true);
                } elseif ($action === 'unmute_conversation' && $chatFlagsReady) {
                    chat_set_flag_for_user($conversationId, (int) $user['id'], 'muted', false);
                } elseif ($action === 'archive_conversation') {
                    archive_conversation_for_user($conversationId, (int) $user['id']);
                } elseif ($action === 'restore_conversation') {
                    restore_conversation_for_user($conversationId, (int) $user['id']);
                } elseif ($action === 'delete_conversation') {
                    delete_conversation_for_user($conversationId, (int) $user['id']);
                    redirect('/chat');
                } elseif ($action === 'report_conversation') {
                    $reportReason = (string) ($_POST['report_reason'] ?? 'other');
                    $reportDescription = (string) ($_POST['report_description'] ?? 'Meldung aus dem Chat.');
                    $reportId = create_chat_report($conversationId, (int) $user['id'], $reportReason, $reportDescription);
                    $_SESSION['flash'] = $reportId
                        ? 'Danke. Deine Meldung wurde an das HOTMESS Team weitergeleitet.'
                        : 'Diese Meldung konnte nicht erstellt werden.';
                } elseif ($action === 'block_member') {
                    $state = chat_conversation_block_state($conversationId, (int) $user['id']);
                    if ((int) $state['otherUserId'] > 0 && chat_block_user((int) $user['id'], (int) $state['otherUserId'], (string) ($_POST['block_reason'] ?? 'Chat blockiert'))) {
                        $_SESSION['flash'] = 'Du hast dieses Mitglied blockiert.';
                    }
                } elseif ($action === 'unblock_member') {
                    $state = chat_conversation_block_state($conversationId, (int) $user['id']);
                    if ((int) $state['otherUserId'] > 0 && chat_unblock_user((int) $user['id'], (int) $state['otherUserId'])) {
                        $_SESSION['flash'] = 'Blockierung wurde aufgehoben.';
                    }
                }
            }

            if ($action === 'report_conversation' && isset($reportId)) {
                $_SESSION['flash'] = $reportId
                    ? 'Danke. Deine Meldung wurde an das HOTMESS Team weitergeleitet.'
                    : 'Diese Meldung konnte nicht erstellt werden.';
            }

            redirect($conversationId > 0 ? chat_href($conversationId) : '/chat');
        }

        if ($action === 'close') {
            $conversationId = (int) ($_POST['conversation_id'] ?? 0);
            if ($conversationId && conversation_belongs_to_user($conversationId, (int) $user['id'])) {
                $stmt = db()->prepare('UPDATE conversations SET closed_at = NOW() WHERE id = ? AND retention = "close"');
                $stmt->execute([$conversationId]);
                $stmt = db()->prepare('UPDATE messages SET deleted_at = NOW() WHERE conversation_id = ? AND deleted_at IS NULL AND saved_at IS NULL');
                $stmt->execute([$conversationId]);
            }
            redirect('/chat');
        }
    } catch (RuntimeException $exception) {
        $errors[] = $exception->getMessage();
    }
}

$contactSearch = trim((string) ($_GET['contacts'] ?? ''));
$contactWhere = '';
$contactSearchParams = [];
if ($contactSearch !== '') {
    $contactClauses = [];
    foreach (search_variants($contactSearch) as $variant) {
        $contactClauses[] = '(users.name LIKE ? OR users.email LIKE ? OR users.city LIKE ?)';
        $like = '%' . $variant . '%';
        array_push($contactSearchParams, $like, $like, $like);
    }
    $contactWhere = ' AND (' . implode(' OR ', $contactClauses) . ')';
}

$membersStmt = db()->prepare(
    "SELECT users.id, users.name, users.email, users.city, users.profile_photo, users.role, users.last_seen_at, sales_partners.id AS partner_id
     FROM users
     LEFT JOIN sales_partners ON sales_partners.user_id = users.id AND sales_partners.status = \"active\"
     WHERE users.status = \"approved\" AND users.role = \"member\" AND users.id <> ?{$contactWhere}
     ORDER BY users.name ASC
     LIMIT 80"
);
$membersStmt->execute(array_merge([(int) $user['id']], $contactSearchParams));
$members = $membersStmt->fetchAll();

$search = trim((string) ($_GET['q'] ?? ''));
$conversationFilter = '';
$conversationSearchParams = [];
if ($search !== '') {
    $conversationClauses = [];
    foreach (search_variants($search) as $variant) {
        $conversationClauses[] = '(users.name LIKE ? OR users.email LIKE ? OR users.city LIKE ? OR messages.body LIKE ? OR conversations.title LIKE ?)';
        $like = '%' . $variant . '%';
        array_push($conversationSearchParams, $like, $like, $like, $like, $like);
    }
    $conversationFilter = ' AND (' . implode(' OR ', $conversationClauses) . ')';
}

$flagSelect = $chatFlagsReady ? 'mine.pinned, mine.muted,' : '0 AS pinned, 0 AS muted,';
$flagGroup = $chatFlagsReady ? ', mine.pinned, mine.muted' : '';
$flagOrder = $chatFlagsReady ? 'mine.pinned DESC,' : '';

$conversationSql = "
    SELECT conversations.id,
      conversations.type,
      conversations.retention,
      conversations.title,
      conversations.closed_at,
      conversations.created_at,
      {$flagSelect}
      COALESCE(MAX(messages.created_at), conversations.created_at) AS last_activity_at,
      MIN(CASE WHEN users.id <> ? THEN users.id END) AS member_id,
      MIN(CASE WHEN users.id <> ? THEN users.name END) AS member_name,
      MIN(CASE WHEN users.id <> ? THEN users.email END) AS member_email,
      MIN(CASE WHEN users.id <> ? THEN users.city END) AS member_city,
      MIN(CASE WHEN users.id <> ? THEN users.profile_photo END) AS avatar_path,
      MIN(CASE WHEN users.id <> ? THEN users.role END) AS member_role,
      MAX(CASE WHEN users.id <> ? THEN users.last_seen_at END) AS member_last_seen_at,
      MAX(CASE WHEN users.id <> ? THEN sales_partners.id END) AS partner_id,
      (SELECT m.created_at FROM messages m LEFT JOIN message_user_deletions mud ON mud.message_id = m.id AND mud.user_id = ? WHERE m.conversation_id = conversations.id AND m.deleted_at IS NULL AND mud.id IS NULL ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
      (SELECT m.body FROM messages m LEFT JOIN message_user_deletions mud ON mud.message_id = m.id AND mud.user_id = ? WHERE m.conversation_id = conversations.id AND m.deleted_at IS NULL AND mud.id IS NULL ORDER BY m.created_at DESC LIMIT 1) AS last_body,
      (SELECT m.message_type FROM messages m LEFT JOIN message_user_deletions mud ON mud.message_id = m.id AND mud.user_id = ? WHERE m.conversation_id = conversations.id AND m.deleted_at IS NULL AND mud.id IS NULL ORDER BY m.created_at DESC LIMIT 1) AS last_type,
      COUNT(DISTINCT CASE WHEN preview_deletions.id IS NULL AND messages.sender_id <> ? AND messages.deleted_at IS NULL AND (conversation_reads.last_read_at IS NULL OR messages.created_at > conversation_reads.last_read_at) THEN messages.id END) AS unread_count
     FROM conversations
     JOIN conversation_participants mine ON mine.conversation_id = conversations.id AND mine.user_id = ?
     JOIN conversation_participants cp ON cp.conversation_id = conversations.id
     JOIN users ON users.id = cp.user_id
     LEFT JOIN sales_partners ON sales_partners.user_id = users.id AND sales_partners.status = \"active\"
     LEFT JOIN messages ON messages.conversation_id = conversations.id AND messages.deleted_at IS NULL
     LEFT JOIN message_user_deletions preview_deletions ON preview_deletions.message_id = messages.id AND preview_deletions.user_id = ?
     LEFT JOIN conversation_reads ON conversation_reads.conversation_id = conversations.id AND conversation_reads.user_id = ?
     WHERE mine.deleted_at IS NULL AND mine.archived_at IS NULL{$conversationFilter}
     GROUP BY conversations.id, conversations.type, conversations.retention, conversations.title, conversations.closed_at, conversations.created_at{$flagGroup}
     ORDER BY {$flagOrder} unread_count DESC, last_activity_at DESC";

$stmt = db()->prepare($conversationSql);
$conversationParams = array_fill(0, 15, (int) $user['id']);
$stmt->execute(array_merge($conversationParams, $conversationSearchParams));
$conversations = chat_unique_conversations($stmt->fetchAll());

$archivedSql = "
    SELECT conversations.id,
      conversations.type,
      conversations.retention,
      conversations.title,
      conversations.closed_at,
      conversations.created_at,
      mine.archived_at,
      MIN(CASE WHEN users.id <> ? THEN users.name END) AS member_name,
      MIN(CASE WHEN users.id <> ? THEN users.email END) AS member_email,
      MIN(CASE WHEN users.id <> ? THEN users.profile_photo END) AS avatar_path,
      (SELECT m.created_at FROM messages m LEFT JOIN message_user_deletions mud ON mud.message_id = m.id AND mud.user_id = ? WHERE m.conversation_id = conversations.id AND m.deleted_at IS NULL AND mud.id IS NULL ORDER BY m.created_at DESC LIMIT 1) AS last_message_at,
      (SELECT m.body FROM messages m LEFT JOIN message_user_deletions mud ON mud.message_id = m.id AND mud.user_id = ? WHERE m.conversation_id = conversations.id AND m.deleted_at IS NULL AND mud.id IS NULL ORDER BY m.created_at DESC LIMIT 1) AS last_body,
      (SELECT m.message_type FROM messages m LEFT JOIN message_user_deletions mud ON mud.message_id = m.id AND mud.user_id = ? WHERE m.conversation_id = conversations.id AND m.deleted_at IS NULL AND mud.id IS NULL ORDER BY m.created_at DESC LIMIT 1) AS last_type
     FROM conversations
     JOIN conversation_participants mine ON mine.conversation_id = conversations.id AND mine.user_id = ?
     JOIN conversation_participants cp ON cp.conversation_id = conversations.id
     JOIN users ON users.id = cp.user_id
     WHERE mine.deleted_at IS NULL AND mine.archived_at IS NOT NULL
     GROUP BY conversations.id, conversations.type, conversations.retention, conversations.title, conversations.closed_at, conversations.created_at, mine.archived_at
     ORDER BY mine.archived_at DESC";
$stmt = db()->prepare($archivedSql);
$stmt->execute(array_fill(0, 7, (int) $user['id']));
$archivedConversations = chat_unique_conversations($stmt->fetchAll());

$activeConversationId = (int) ($_GET['conversation'] ?? 0);
$activeConversation = null;
$activeParticipants = [];
$messages = [];
$inactiveConversationState = null;
$activeMember = null;
$activeTier = 'free';

if ($activeConversationId && conversation_belongs_to_user($activeConversationId, (int) $user['id'])) {
    $stmt = db()->prepare('SELECT * FROM conversations WHERE id = ? LIMIT 1');
    $stmt->execute([$activeConversationId]);
    $activeConversation = $stmt->fetch();

    $stmt = db()->prepare(
        'SELECT users.id, users.name, users.email, users.city, users.profile_photo, users.role, users.last_seen_at, conversation_participants.last_read_at, sales_partners.id AS partner_id
         FROM conversation_participants
         JOIN users ON users.id = conversation_participants.user_id
         LEFT JOIN sales_partners ON sales_partners.user_id = users.id AND sales_partners.status = "active"
         WHERE conversation_participants.conversation_id = ?
         ORDER BY (users.id = ?) ASC, users.role ASC, users.name ASC'
    );
    $stmt->execute([$activeConversationId, (int) $user['id']]);
    $activeParticipants = $stmt->fetchAll();
    foreach ($activeParticipants as $participant) {
        if ((int) $participant['id'] !== (int) $user['id']) {
            $activeMember = $participant;
            break;
        }
    }

    if ($activeMember) {
        $canonicalConversationId = chat_find_direct_conversation((int) $user['id'], (int) $activeMember['id'], (string) ($activeConversation['type'] ?? 'member'));
        if ($canonicalConversationId > 0 && $canonicalConversationId !== $activeConversationId) {
            redirect(chat_href($canonicalConversationId));
        }
    }

    chat_mark_read_for_user($activeConversationId, (int) $user['id']);

    $stmt = db()->prepare(
        'SELECT messages.*,
          users.name AS sender_name,
          users.profile_photo AS sender_photo,
          reply.body AS reply_body,
          reply_sender.name AS reply_sender_name,
          GROUP_CONCAT(DISTINCT CONCAT(chat_message_reactions.emoji, " ", reaction_users.name) ORDER BY chat_message_reactions.updated_at SEPARATOR "||") AS reactions
         FROM messages
         JOIN users ON users.id = messages.sender_id
         LEFT JOIN messages reply ON reply.id = messages.reply_to_message_id
         LEFT JOIN users reply_sender ON reply_sender.id = reply.sender_id
         LEFT JOIN chat_message_reactions ON chat_message_reactions.message_id = messages.id
         LEFT JOIN users reaction_users ON reaction_users.id = chat_message_reactions.user_id
         LEFT JOIN message_user_deletions mud ON mud.message_id = messages.id AND mud.user_id = ?
         WHERE messages.conversation_id = ? AND messages.deleted_at IS NULL AND mud.id IS NULL
           AND (messages.scheduled_at IS NULL OR messages.scheduled_at <= NOW() OR messages.sender_id = ?)
         GROUP BY messages.id
         ORDER BY COALESCE(messages.scheduled_at, messages.created_at) ASC'
    );
    $stmt->execute([(int) $user['id'], $activeConversationId, (int) $user['id']]);
    $messages = $stmt->fetchAll();
} elseif ($activeConversationId) {
    $stmt = db()->prepare('SELECT archived_at, deleted_at FROM conversation_participants WHERE conversation_id = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$activeConversationId, (int) $user['id']]);
    $inactiveConversationState = $stmt->fetch() ?: null;
}

$activeTitle = 'Wähle eine Unterhaltung aus';
if ($activeConversation) {
    $activeTitle = $activeConversation['type'] === 'organizer'
        ? 'HOTMESS Concierge'
        : (string) ($activeMember['name'] ?? 'HOTMESS Mitglied');
    $activeTier = $activeMember ? chat_member_tier($activeMember) : 'concierge';
}
$latestMessageId = 0;
foreach ($messages as $message) {
    $latestMessageId = max($latestMessageId, (int) $message['id']);
}

$flash = (string) ($_SESSION['flash'] ?? '');
unset($_SESSION['flash']);

render_header('HOTMESS Chat');
?>

<main class="chat-page <?= $activeConversation ? 'has-active-chat' : '' ?>">
  <section class="chat-shell" aria-label="HOTMESS Mitglieder-Chat">
    <aside class="chat-sidebar">
      <div class="chat-sidebar-head">
        <div>
          <p class="eyebrow">Mitglieder-Chat</p>
          <h1>HOTMESS Chat</h1>
          <small><?= e((string) $user['name']) ?> · <span class="online-dot is-online"></span> online</small>
        </div>
        <details class="new-chat-popover">
          <summary class="button primary">Neuer Chat</summary>
          <div class="new-chat-panel">
            <form class="stack-form" method="get" action="/chat">
              <label>Mitglieder suchen
                <input name="contacts" value="<?= e($contactSearch) ?>" placeholder="Name, Username oder Stadt" />
              </label>
              <button class="button ghost" type="submit">Suchen</button>
            </form>
            <form class="stack-form" method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="action" value="start_member" />
              <label>Chat-Dauer
                <select name="retention">
                  <option value="24h">24 Stunden</option>
                  <option value="close">Bis zum Schließen</option>
                </select>
              </label>
              <div class="contact-picker" aria-label="Mitglieder auswählen">
                <?php foreach ($members as $member): ?>
                  <?php
                    $tier = chat_member_tier($member);
                    $username = chat_username((string) ($member['email'] ?? ''), (string) $member['name']);
                  ?>
                  <label>
                    <input type="radio" name="recipient_id" value="<?= e((string) $member['id']) ?>" required />
                    <span class="avatar small"><?= chat_avatar($member['profile_photo'] ?? null, (string) $member['name']) ?></span>
                    <span>
                      <?= e((string) $member['name']) ?>
                      <small><?= e($username) ?> · <?= e((string) $member['city']) ?></small>
                      <em class="membership-badge <?= e(chat_member_tier_class($tier)) ?>"><?= e(chat_member_tier_label($tier)) ?></em>
                    </span>
                  </label>
                <?php endforeach; ?>
              </div>
              <button class="button primary" type="submit">Unterhaltung starten</button>
            </form>
          </div>
        </details>
      </div>

      <form class="chat-search" method="get" action="/chat">
        <input name="q" value="<?= e($search) ?>" placeholder="Mitglieder suchen oder Chat starten" />
      </form>

      <nav class="conversation-list" aria-label="Persönliche Unterhaltungen">
        <?php foreach ($conversations as $conversation): ?>
          <?php
            $memberName = $conversation['type'] === 'organizer' ? 'HOTMESS Concierge' : (string) ($conversation['member_name'] ?? 'HOTMESS Mitglied');
            $memberEmail = (string) ($conversation['member_email'] ?? '');
            $tier = chat_member_tier([
                'role' => (string) ($conversation['member_role'] ?? ''),
                'partner_id' => $conversation['partner_id'] ?? null,
            ]);
            $hasLastMessage = !empty($conversation['last_message_at']);
            $previewType = $hasLastMessage ? chat_message_type_label((string) ($conversation['last_type'] ?? 'text')) : 'Chat';
            $preview = $hasLastMessage ? (trim((string) ($conversation['last_body'] ?? '')) ?: $previewType) : 'Noch keine Chat-Aktivität';
            $unreadCount = (int) ($conversation['unread_count'] ?? 0);
            $isUnread = $unreadCount > 0;
            $isPinned = (int) ($conversation['pinned'] ?? 0) === 1;
            $isMuted = (int) ($conversation['muted'] ?? 0) === 1;
            $online = is_user_online($conversation['member_last_seen_at'] ?? null);
          ?>
          <a
            class="conversation-item <?= (int) $conversation['id'] === $activeConversationId ? 'is-active' : '' ?> <?= $isUnread ? 'is-unread' : '' ?> <?= $isPinned ? 'is-pinned' : '' ?>"
            href="<?= e(chat_href((int) $conversation['id'])) ?>"
            data-conversation-context
            data-conversation-id="<?= e((string) $conversation['id']) ?>"
            data-member-id="<?= e((string) ($conversation['member_id'] ?? 0)) ?>"
            data-pinned="<?= $isPinned ? '1' : '0' ?>"
            data-muted="<?= $isMuted ? '1' : '0' ?>"
          >
            <span class="avatar-wrap">
              <span class="avatar"><?= chat_avatar($conversation['avatar_path'] ?? null, $memberName) ?></span>
              <span class="online-dot <?= $online ? 'is-online' : '' ?>"></span>
            </span>
            <span class="conversation-copy">
              <strong><?= e($memberName) ?><?= $isPinned ? ' · Angeheftet' : '' ?></strong>
              <span><?= e(chat_username($memberEmail, $memberName)) ?> · <em class="membership-badge <?= e(chat_member_tier_class($tier)) ?>"><?= e(chat_member_tier_label($tier)) ?></em></span>
              <small><?= $isMuted ? 'Stumm · ' : '' ?><b><?= e($previewType) ?></b> <?= e(chat_short_preview($preview)) ?></small>
            </span>
            <span class="conversation-meta">
              <small><?= e($conversation['last_message_at'] ? date('H:i', strtotime((string) $conversation['last_message_at'])) : chat_retention_label((string) $conversation['retention'])) ?></small>
              <?php if ($isUnread): ?>
                <b><?= e((string) $unreadCount) ?></b>
                <i class="chat-unread-dot" aria-label="Ungelesen"></i>
              <?php endif; ?>
            </span>
          </a>
        <?php endforeach; ?>
        <?php if (!$conversations): ?>
          <article class="chat-empty-state compact">
            <h3>Keine Unterhaltung gefunden</h3>
            <p>Starte einen Chat mit einem HOTMESS Mitglied oder dem Concierge.</p>
          </article>
        <?php endif; ?>
      </nav>

      <div class="chat-context-backdrop" data-conversation-context-backdrop hidden></div>
      <div class="ig-message-context hotmess-chat-action-menu" data-conversation-context-menu hidden>
        <div class="ig-context-card">
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="conversation_id" value="" data-overview-conversation-id />
            <button class="chat-context-action" name="action" value="pin_conversation" type="submit" data-overview-pin-action>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14.5 4.5 19 9l-2 2 1.5 1.5-2.1 2.1-3-3-4.8 4.8-.7 4.2-1.5-1.5.7-4.2 4.8-4.8-3-3L11 5.5 12.5 7l2-2Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
              <span>Fixieren</span>
            </button>
          </form>
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="conversation_id" value="" data-overview-conversation-id />
            <button class="chat-context-action" name="action" value="mute_conversation" type="submit" data-overview-mute-action>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M15 17H8l1.4-1.8V11a5 5 0 0 1 8.2-3.8M18.5 11.5v3.2L20 17h-2.8M10 19a2 2 0 0 0 4 0M4 4l16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
              <span>Stummschalten</span>
            </button>
          </form>
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="conversation_id" value="" data-overview-conversation-id />
            <input type="hidden" name="report_reason" value="other" />
            <input type="hidden" name="report_description" value="Meldung aus der Chatliste." />
            <button class="chat-context-action" name="action" value="report_conversation" type="submit">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 4v17M6 5h11l-1.5 4L17 13H6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
              <span>Melden</span>
            </button>
          </form>
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="conversation_id" value="" data-overview-conversation-id />
            <button class="chat-context-action danger" name="action" value="delete_conversation" type="submit" data-confirm="Dieser Chat wird nur für dich endgültig aus deiner Liste entfernt. Andere Teilnehmer behalten ihn.">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 16h10l1-16M9 7l1-3h4l1 3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
              <span>Löschen</span>
            </button>
          </form>
        </div>
      </div>

      <div class="chat-sidebar-actions">
        <form method="post">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <button class="button ghost" name="action" value="start_concierge" type="submit">Concierge kontaktieren</button>
        </form>
      </div>

      <details class="archived-chat-box">
        <summary>Archivierte Chats <?= $archivedConversations ? '(' . e((string) count($archivedConversations)) . ')' : '' ?></summary>
        <div class="archived-chat-list">
          <?php if (!$archivedConversations): ?>
            <p>Keine archivierten Chats.</p>
          <?php endif; ?>
          <?php foreach ($archivedConversations as $conversation): ?>
            <?php
              $memberName = $conversation['type'] === 'organizer' ? 'HOTMESS Concierge' : (string) ($conversation['member_name'] ?? 'HOTMESS Mitglied');
              $hasLastMessage = !empty($conversation['last_message_at']);
              $previewType = $hasLastMessage ? chat_message_type_label((string) ($conversation['last_type'] ?? 'text')) : 'Chat';
              $preview = $hasLastMessage ? (trim((string) ($conversation['last_body'] ?? '')) ?: $previewType) : 'Noch keine Chat-Aktivität';
            ?>
            <article class="archived-chat-item">
              <span class="avatar small"><?= chat_avatar($conversation['avatar_path'] ?? null, $memberName) ?></span>
              <div>
                <strong><?= e($memberName) ?></strong>
                <small><?= e($previewType) ?> · <?= e(chat_short_preview($preview, 44)) ?></small>
                <small><?= e($conversation['last_message_at'] ? date('d.m.Y H:i', strtotime((string) $conversation['last_message_at'])) : 'Noch keine Aktivität') ?></small>
              </div>
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="conversation_id" value="<?= e((string) $conversation['id']) ?>" />
                <button name="action" value="restore_conversation" type="submit">Wiederherstellen</button>
                <button name="action" value="delete_conversation" type="submit" data-confirm="Dieser Chat wird nur für dich endgültig aus deiner Liste entfernt. Andere Teilnehmer behalten ihn.">Löschen</button>
              </form>
            </article>
          <?php endforeach; ?>
        </div>
      </details>
    </aside>

    <section class="chat-window" data-active-conversation-id="<?= e((string) $activeConversationId) ?>" data-latest-message-id="<?= e((string) $latestMessageId) ?>" data-active-chat-content-id="chat:<?= e((string) $activeConversationId) ?>">
      <?php foreach ($errors as $error): ?>
        <p class="notice"><?= e($error) ?></p>
      <?php endforeach; ?>
      <?php if ($flash): ?>
        <p class="notice"><?= e($flash) ?></p>
      <?php endif; ?>

      <?php if ($activeConversation): ?>
        <?php
          $activeUsername = $activeMember ? chat_username((string) ($activeMember['email'] ?? ''), (string) $activeMember['name']) : '@hotmess.concierge';
          $activeOnline = $activeMember ? is_user_online($activeMember['last_seen_at'] ?? null) : true;
          $activePinned = false;
          $activeMuted = false;
          $activeBlockState = $activeMember ? chat_conversation_block_state($activeConversationId, (int) $user['id']) : ['blockedByMe' => false, 'blockedMe' => false, 'otherUserId' => 0];
          foreach ($conversations as $conversation) {
              if ((int) $conversation['id'] === $activeConversationId) {
                  $activePinned = (int) ($conversation['pinned'] ?? 0) === 1;
                  $activeMuted = (int) ($conversation['muted'] ?? 0) === 1;
                  break;
              }
          }
        ?>
        <div class="chat-header">
          <a class="chat-back-link" href="/chat" aria-label="Zurück zur Chatübersicht">←</a>
          <div class="chat-title-row">
            <span class="avatar-wrap">
              <span class="avatar large"><?= chat_avatar($activeMember['profile_photo'] ?? null, $activeTitle) ?></span>
              <span class="online-dot <?= $activeOnline ? 'is-online' : '' ?>"></span>
            </span>
            <div>
              <p class="eyebrow"><?= e(chat_conversation_type_label((string) $activeConversation['type'], $activeTier)) ?></p>
              <h2><?= e($activeTitle ?: 'Chat') ?></h2>
              <small><?= e($activeUsername) ?> · <em class="membership-badge <?= e(chat_member_tier_class($activeTier)) ?>"><?= e(chat_member_tier_label($activeTier)) ?></em> · <?= e(chat_retention_label((string) $activeConversation['retention'])) ?></small>
            </div>
          </div>
          <div class="chat-call-actions" aria-label="Chat-Anrufe vorbereitet">
            <button type="button" title="Telefonanruf vorbereitet">☎</button>
            <button type="button" title="Videoanruf vorbereitet">▣</button>
          </div>
          <details class="chat-actions-menu">
            <summary class="button ghost">Aktionen</summary>
            <form method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
              <button name="action" value="mark_read" type="submit">Als gelesen markieren</button>
              <button name="action" value="<?= $activePinned ? 'unpin_conversation' : 'pin_conversation' ?>" type="submit"><?= $activePinned ? 'Nicht mehr anheften' : 'Anheften' ?></button>
              <button name="action" value="<?= $activeMuted ? 'unmute_conversation' : 'mute_conversation' ?>" type="submit"><?= $activeMuted ? 'Stummschaltung aus' : 'Stummschalten' ?></button>
              <?php if ($activeMember): ?>
                <a href="/profile.php?id=<?= e((string) $activeMember['id']) ?>">Mitglied ansehen</a>
              <?php endif; ?>
              <label class="chat-report-field">Meldegrund
                <select name="report_reason">
                  <option value="harassment">Belästigung</option>
                  <option value="insult">Beleidigung</option>
                  <option value="spam">Spam</option>
                  <option value="threat">Bedrohung</option>
                  <option value="fake_profile">Fake-Profil</option>
                  <option value="inappropriate_content">Unangemessener Inhalt</option>
                  <option value="other">Sonstiges</option>
                </select>
              </label>
              <label class="chat-report-field">Beschreibung
                <textarea name="report_description" rows="3" placeholder="Optionaler Hinweis fuer das HOTMESS Team"></textarea>
              </label>
              <button name="action" value="report_conversation" type="submit">Melden</button>
              <?php if ($activeMember): ?>
                <input type="hidden" name="block_reason" value="Blockierung im HOTMESS Chat" />
                <button name="action" value="<?= $activeBlockState['blockedByMe'] ? 'unblock_member' : 'block_member' ?>" type="submit">
                  <?= $activeBlockState['blockedByMe'] ? 'Blockierung aufheben' : 'Mitglied blockieren' ?>
                </button>
              <?php endif; ?>
              <button name="action" value="archive_conversation" type="submit">Archivieren</button>
              <button name="action" value="delete_conversation" type="submit" data-confirm="Dieser Chat wird nur für dich endgültig aus deiner Liste entfernt. Andere Teilnehmer behalten ihn.">Löschen</button>
            </form>
          </details>
        </div>

        <?php if (!$userChatRestriction['allowed'] || $activeBlockState['blockedByMe'] || $activeBlockState['blockedMe']): ?>
          <section class="chat-feature-strip" aria-label="Blockierungsstatus">
            <span><?= e(!$userChatRestriction['allowed'] ? $userChatRestriction['message'] : ($activeBlockState['blockedByMe'] ? 'Du hast dieses Mitglied blockiert.' : 'Dieser Chat ist aktuell eingeschraenkt.')) ?></span>
            <span>Bestehende Chat-Beitraege bleiben sichtbar.</span>
          </section>
        <?php endif; ?>

        <section class="chat-feature-strip" aria-label="Chat-Funktionen">
          <span>Status: Gesendet · Zugestellt · Gesehen</span>
          <span>Antworten · Reaktionen · Weiterleiten</span>
          <span>Fotos · Videos · Audio · Medien-Modus</span>
          <span>Bearbeiten · Zurückrufen · Planen</span>
          <span>Übersetzung und Push vorbereitet</span>
        </section>

        <div class="message-list">
          <?php if (!$messages): ?>
            <article class="chat-empty-state">
              <h3>Noch keine Chat-Aktivität.</h3>
              <p>Starte diese Unterhaltung mit einem kurzen, persönlichen Beitrag.</p>
            </article>
          <?php endif; ?>
          <?php foreach ($messages as $message): ?>
            <?php
              $isDeletedForAll = !empty($message['deleted_for_all_at']);
              $isSystemMessage = (string) ($message['message_type'] ?? '') === 'system';
              $messageStatus = chat_message_status_key($message, $activeParticipants, (int) $user['id']);
              $isScheduled = !empty($message['scheduled_at']) && strtotime((string) $message['scheduled_at']) > time();
              $reactions = array_filter(explode('||', (string) ($message['reactions'] ?? '')));
            ?>
            <article class="message <?= (int) $message['sender_id'] === (int) $user['id'] ? 'is-mine' : '' ?> <?= $isSystemMessage ? 'is-system' : '' ?>">
              <?php if (!$isSystemMessage): ?>
                <div class="message-avatar avatar small"><?= chat_avatar($message['sender_photo'] ?? null, (string) $message['sender_name']) ?></div>
              <?php endif; ?>
              <div
                class="message-bubble <?= $isDeletedForAll ? 'is-deleted' : '' ?>"
                <?= $isSystemMessage ? '' : 'data-message-action-context' ?>
                data-message-id="<?= e((string) $message['id']) ?>"
                data-message-text="<?= e((string) ($message['body'] ?? '')) ?>"
                data-message-preview="<?= e(chat_short_preview((string) ($message['body'] ?: chat_message_type_label((string) $message['message_type'])), 80)) ?>"
                data-can-recall="<?= (int) $message['sender_id'] === (int) $user['id'] ? '1' : '0' ?>"
                data-can-edit="<?= (int) $message['sender_id'] === (int) $user['id'] ? '1' : '0' ?>"
              >
                <?php if ($isSystemMessage): ?>
                  <p><?= e((string) ($message['body'] ?? 'Systemereignis')) ?></p>
                <?php elseif ($isDeletedForAll): ?>
                  <p class="deleted-message">Dieser Chat-Beitrag wurde gelöscht.</p>
                <?php else: ?>
                  <?php if (!empty($message['reply_to_message_id'])): ?>
                    <blockquote class="message-reply-preview">
                      <strong><?= e((string) ($message['reply_sender_name'] ?? 'HOTMESS')) ?></strong>
                      <span><?= e(chat_short_preview((string) ($message['reply_body'] ?? 'Medienbeitrag'), 80)) ?></span>
                    </blockquote>
                  <?php endif; ?>
                  <?php if ($message['media_path']): ?>
                    <?php if ($message['message_type'] === 'image'): ?>
                      <img class="chat-media" src="<?= e($message['media_path']) ?>" alt="Chat Foto" />
                    <?php elseif ($message['message_type'] === 'video'): ?>
                      <video class="chat-media" src="<?= e($message['media_path']) ?>" controls playsinline></video>
                    <?php elseif ($message['message_type'] === 'audio'): ?>
                      <audio src="<?= e($message['media_path']) ?>" controls></audio>
                    <?php endif; ?>
                  <?php endif; ?>
                  <?php if (trim((string) $message['body']) !== ''): ?>
                    <p><?= nl2br(e((string) $message['body'])) ?></p>
                  <?php endif; ?>
                  <?php if (!empty($message['media_path'])): ?>
                    <small class="media-visibility-note"><?= e(chat_media_visibility_label((string) ($message['media_visibility'] ?? 'keep'))) ?></small>
                  <?php endif; ?>
                <?php endif; ?>
                <?php if ($reactions): ?>
                  <div class="message-reactions" aria-label="Reaktionen">
                    <?php foreach ($reactions as $reaction): ?>
                      <span><?= e($reaction) ?></span>
                    <?php endforeach; ?>
                  </div>
                <?php endif; ?>
                <span>
                  <?= e(date('d.m.Y H:i', strtotime((string) ($message['scheduled_at'] ?: $message['created_at'])))) ?>
                  <?= $isScheduled ? ' · geplant' : '' ?>
                  <?= !empty($message['edited_at']) ? ' · bearbeitet' : '' ?>
                  <?= $message['saved_at'] ? ' · gespeichert' : '' ?>
                  <?php if ($messageStatus && !$isSystemMessage): ?>
                    <span class="message-status-ticks <?= e($messageStatus) ?>" aria-label="<?= e(chat_message_status_label($messageStatus)) ?>" title="<?= e(chat_message_status_label($messageStatus)) ?>">
                      <?= $messageStatus === 'sent' ? '✓' : '✓✓' ?>
                    </span>
                  <?php endif; ?>
                </span>
                <?php if (!$isSystemMessage): ?>
                <form class="message-actions" method="post">
                  <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                  <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
                  <input type="hidden" name="message_id" value="<?= e((string) $message['id']) ?>" />
                  <?php if (!$isDeletedForAll): ?>
                    <?php if (trim((string) $message['body']) !== ''): ?>
                      <button type="button" data-copy-message="<?= e((string) $message['body']) ?>">Kopieren</button>
                    <?php endif; ?>
                    <button type="button" data-reply-message="<?= e((string) $message['id']) ?>" data-reply-preview="<?= e(chat_short_preview((string) ($message['body'] ?: chat_message_type_label((string) $message['message_type'])), 80)) ?>">Antworten</button>
                    <details class="inline-message-menu">
                      <summary>Reagieren</summary>
                      <div>
                        <?php foreach (['❤️', '👍', '😂', '🔥', '😍', '👏'] as $emoji): ?>
                          <button name="action" value="react_message" type="submit" onclick="this.form.emoji.value='<?= e($emoji) ?>'"><?= e($emoji) ?></button>
                        <?php endforeach; ?>
                      </div>
                    </details>
                    <input type="hidden" name="emoji" value="❤️" />
                    <button name="action" value="save_message" type="submit">Speichern</button>
                    <details class="inline-message-menu">
                      <summary>Weiterleiten</summary>
                      <div>
                        <select name="forward_recipient_id">
                          <option value="">Mitglied wählen</option>
                          <?php foreach ($members as $member): ?>
                            <option value="<?= e((string) $member['id']) ?>"><?= e((string) $member['name']) ?></option>
                          <?php endforeach; ?>
                        </select>
                        <button name="action" value="forward_message" type="submit">Senden</button>
                      </div>
                    </details>
                    <button name="action" value="translate_message" type="submit">Übersetzen</button>
                    <?php if ((int) $message['sender_id'] === (int) $user['id']): ?>
                      <details class="inline-message-menu">
                        <summary>Bearbeiten</summary>
                        <div>
                          <textarea name="edited_body" rows="2"><?= e((string) ($message['body'] ?? '')) ?></textarea>
                          <button name="action" value="edit_message" type="submit">Speichern</button>
                        </div>
                      </details>
                    <?php endif; ?>
                    <button name="action" value="delete_message_for_me" type="submit" data-confirm="Dieser Beitrag wird nur für dich gelöscht.">Für mich löschen</button>
                    <?php if ((int) $message['sender_id'] === (int) $user['id']): ?>
                      <button name="action" value="delete_message_for_all" type="submit" data-confirm="Dieser Beitrag wird für alle Chatteilnehmer gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.">Zurückrufen</button>
                    <?php endif; ?>
                  <?php endif; ?>
                </form>
                <?php endif; ?>
              </div>
            </article>
          <?php endforeach; ?>
        </div>

        <button class="chat-scroll-bottom" type="button" aria-label="Zum neuesten Chat-Beitrag" data-scroll-bottom hidden>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
        </button>

        <div class="chat-context-backdrop" data-message-action-backdrop hidden></div>
        <div class="ig-message-context hotmess-chat-action-menu" data-message-action-menu hidden>
          <div class="ig-context-card chat-message-action-card">
            <button class="chat-context-action" type="button" data-message-action-reply>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M9 7 4 12l5 5M5 12h9a6 6 0 0 1 6 6v1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
              <span>Antworten</span>
            </button>
            <form method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
              <input type="hidden" name="message_id" value="" data-message-action-id />
              <input type="hidden" name="emoji" value="❤️" />
              <button class="chat-context-action" name="action" value="react_message" type="submit">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9-9a4.7 4.7 0 0 1 8-4.9A4.7 4.7 0 0 1 19 11c-2 4.6-7 9-7 9Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
                <span>Reagieren</span>
              </button>
            </form>
            <button class="chat-context-action" type="button" data-message-action-copy>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 8h11v13H8zM5 16H4a1 1 0 0 1-1-1V4h12v1" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
              <span>Kopieren</span>
            </button>
            <form method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
              <input type="hidden" name="message_id" value="" data-message-action-id />
              <button class="chat-context-action" name="action" value="save_message" type="submit">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 4h12v18l-6-4-6 4z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
                <span>Speichern</span>
              </button>
            </form>
            <form method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
              <input type="hidden" name="message_id" value="" data-message-action-id />
              <button class="chat-context-action" name="action" value="translate_message" type="submit">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 5h9M9 3v2m-4 7c3-1.6 5-4.2 6-7M7 8c1.1 2.1 2.4 3.4 4 4M14 21l4-9 4 9M15.5 18h5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
                <span>Übersetzen</span>
              </button>
            </form>
            <button class="chat-context-action" type="button" data-message-action-edit>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20ZM13.5 6.5l3 3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
              <span>Bearbeiten</span>
            </button>
            <form method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
              <input type="hidden" name="message_id" value="" data-message-action-id />
              <button class="chat-context-action" name="action" value="delete_message_for_me" type="submit" data-confirm="Dieser Beitrag wird nur für dich gelöscht.">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 16h10l1-16M9 7l1-3h4l1 3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
                <span>Für mich löschen</span>
              </button>
            </form>
            <form method="post" data-message-action-recall-form>
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
              <input type="hidden" name="message_id" value="" data-message-action-id />
              <button class="chat-context-action danger" name="action" value="delete_message_for_all" type="submit" data-confirm="Dieser Beitrag wird für alle Chatteilnehmer gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 4.9 2.7 18a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 4.9a2 2 0 0 0-3.4 0Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/></svg>
                <span>Zurückrufen</span>
              </button>
            </form>
          </div>
        </div>

        <form class="message-form" method="post" enctype="multipart/form-data">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="action" value="send" />
          <input type="hidden" name="conversation_id" value="<?= e((string) $activeConversationId) ?>" />
          <input type="hidden" name="reply_to_message_id" value="" data-reply-target />
          <div class="chat-plus-wrap">
            <button class="chat-icon-button chat-plus-button" type="button" aria-label="Medienmen&uuml; &ouml;ffnen" aria-expanded="false" data-media-menu-toggle <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?>>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2"/></svg>
            </button>
            <div class="chat-media-menu" data-media-menu hidden>
              <label class="chat-media-option" title="Kamera">
                <span class="chat-media-option-icon">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/><path d="M9 13a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                </span>
                <span><strong>Kamera</strong><small>Foto oder Video aufnehmen</small></span>
                <input type="file" name="media_camera" accept="image/*,video/*" capture="environment" <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?> />
              </label>
              <label class="chat-media-option" title="Galerie">
                <span class="chat-media-option-icon">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 5h14v14H5z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/><path d="m8 16 3-3 2 2 2-3 3 4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"/><path d="M9 9h.01" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2.4"/></svg>
                </span>
                <span><strong>Galerie</strong><small>Foto oder Video ausw&auml;hlen</small></span>
                <input type="file" name="media_gallery" accept="image/*,video/*" <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?> />
              </label>
              <label class="chat-media-option" title="Audio ausw&auml;hlen">
                <span class="chat-media-option-icon">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>
                </span>
                <span><strong>Audio aufnehmen</strong><small>Sprachnachricht aufnehmen</small></span>
                <input type="file" name="media_audio" accept="audio/*" <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?> />
              </label>
            </div>
          </div>
          <label class="media-button" title="Kamera">
            CAM
            <input type="file" name="legacy_media_camera" accept="image/*,video/*" capture="environment" disabled />
          </label>
          <label class="media-button" title="Galerie">
            GAL
            <input type="file" name="legacy_media_gallery" accept="image/*,video/*" disabled />
          </label>
          <label class="media-button" title="Audio">
            MIC
            <input type="file" name="legacy_media_audio" accept="audio/*" disabled />
          </label>
          <button class="media-button voice-record-button" type="button" title="Gedrückt halten für Sprachnachricht" data-voice-record <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?>>REC</button>
          <div class="message-compose">
            <div class="reply-compose-preview" hidden>
              <span></span>
              <button type="button" data-clear-reply aria-label="Antwort entfernen">×</button>
            </div>
            <div class="message-input-shell">
              <textarea name="body" rows="1" placeholder="Nachricht schreiben" data-chat-input <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?>></textarea>
              <button class="chat-icon-button voice-record-button chat-voice-inline" type="button" title="Sprachnachricht aufnehmen" aria-label="Sprachnachricht aufnehmen" data-voice-record <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?>>
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>
              </button>
            </div>
            <div class="compose-options">
              <label>Medien
                <select name="media_visibility">
                  <option value="keep">Im Chat behalten</option>
                  <option value="once">Einmal ansehen</option>
                  <option value="replay">Wiederholung erlauben</option>
                </select>
              </label>
              <label>Planen
                <input type="datetime-local" name="scheduled_at" />
              </label>
            </div>
          </div>
          <button class="chat-icon-button chat-send-button" type="submit" aria-label="Chat-Beitrag senden" data-send-button hidden <?= !$userChatRestriction['allowed'] ? 'disabled' : '' ?>>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m4 12 16-8-4 16-4-7-8-1Z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.8"/><path d="m12 13 8-9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>
          </button>
          <div class="voice-record-status" data-voice-status hidden>
            <span>Aufnahme l&auml;uft</span>
            <strong data-voice-timer>00:00</strong>
            <button type="button" data-voice-stop>Stoppen</button>
          </div>
          <button class="button primary legacy-send-button" type="submit" <?= !$userChatRestriction['allowed'] || !empty($activeBlockState['blockedByMe']) || !empty($activeBlockState['blockedMe']) ? 'disabled' : '' ?>>Senden</button>
        </form>
      <?php else: ?>
        <div class="empty-chat">
          <?php if ($inactiveConversationState && !empty($inactiveConversationState['deleted_at'])): ?>
            <h2>Dieser Chat wurde für dich gelöscht.</h2>
            <p>Andere Teilnehmer sehen ihn weiterhin. Sobald wieder ein neuer Beitrag eingeht, kann die Unterhaltung erneut erscheinen.</p>
          <?php else: ?>
            <h2>Wähle eine Unterhaltung aus</h2>
            <p>Starte einen Chat mit einem HOTMESS Mitglied oder öffne eine bestehende Unterhaltung.</p>
            <details class="new-chat-popover empty-state-action">
              <summary class="button primary">Neuer Chat</summary>
              <div class="new-chat-panel">
                <form class="stack-form" method="get" action="/chat">
                  <label>Mitglieder suchen
                    <input name="contacts" value="<?= e($contactSearch) ?>" placeholder="Name, Username oder Stadt" />
                  </label>
                  <button class="button ghost" type="submit">Suchen</button>
                </form>
              </div>
            </details>
          <?php endif; ?>
        </div>
      <?php endif; ?>
    </section>
  </section>
</main>

<script>
(() => {
  const chatWindow = document.querySelector('[data-active-conversation-id]');
  if (!chatWindow) return;
  const conversationId = Number(chatWindow.dataset.activeConversationId || 0);
  if (!conversationId) return;
  const list = document.querySelector('.message-list');
  let latestId = Number(chatWindow.dataset.latestMessageId || 0);
  const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  const renderMessage = (message) => {
    const article = document.createElement('article');
    article.className = 'message' + (message.mine ? ' is-mine' : '') + (message.message_type === 'system' ? ' is-system' : '');
    const media = message.media_url && message.message_type === 'image'
      ? `<img class="chat-media" src="/${escapeHtml(message.media_url).replace(/^\\//, '')}" alt="Chat Foto" />`
      : (message.media_url && message.message_type === 'video'
        ? `<video class="chat-media" src="/${escapeHtml(message.media_url).replace(/^\\//, '')}" controls playsinline></video>`
        : (message.media_url && message.message_type === 'audio'
          ? `<audio src="/${escapeHtml(message.media_url).replace(/^\\//, '')}" controls></audio>`
          : ''));
    const status = message.mine && message.status ? `<span class="message-status-ticks ${escapeHtml(message.status)}">${message.status === 'sent' ? '✓' : '✓✓'}</span>` : '';
    article.innerHTML = `
      ${message.message_type === 'system' ? '' : '<div class="message-avatar avatar small">HM</div>'}
      <div class="message-bubble" data-message-id="${Number(message.id)}">
        ${media}
        ${message.body ? `<p>${escapeHtml(message.body).replace(/\\n/g, '<br>')}</p>` : ''}
        <span>${escapeHtml(message.created_at)} ${status}</span>
      </div>`;
    return article;
  };
  const updateUnreadBadges = (conversations) => {
    conversations.forEach((item) => {
      const node = document.querySelector(`[data-conversation-id="${item.conversation_id}"]`);
      if (!node) return;
      node.classList.toggle('is-unread', Number(item.unread_count) > 0);
      const badge = node.querySelector('.unread-badge');
      if (badge) badge.textContent = Number(item.unread_count) > 0 ? String(item.unread_count) : '';
    });
  };
  const poll = async () => {
    try {
      const response = await fetch(`/api/chat/poll?conversation_id=${conversationId}&after_id=${latestId}`, { headers: { 'Accept': 'application/json' } });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.ok) return;
      updateUnreadBadges(data.conversations || []);
      (data.messages || []).forEach((message) => {
        if (document.querySelector(`[data-message-id="${message.id}"]`)) return;
        list?.appendChild(renderMessage(message));
        latestId = Math.max(latestId, Number(message.id));
        chatWindow.dataset.latestMessageId = String(latestId);
      });
    } catch (error) {
      // Polling is a fallback; temporary network failures should not interrupt the chat.
    }
  };
  window.setInterval(poll, 7000);
})();
</script>

<?php render_footer(); ?>
