<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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
$conversationId = (int) ($_GET['conversationId'] ?? $_POST['conversation_id'] ?? 0);

if (!$conversationId || !delete_conversation_for_user($conversationId, (int) $user['id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Conversation not available']);
    exit;
}

echo json_encode(['ok' => true]);
