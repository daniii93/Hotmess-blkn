<?php

declare(strict_types=1);

require_once __DIR__ . '/../app/bootstrap.php';
require_once __DIR__ . '/../app/concierge-data.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$user = current_user();
echo json_encode([
    'mode' => getenv('OPENAI_API_KEY') ? 'ai-ready' : 'mock',
    'profile' => hotmess_concierge_profile($user),
    'recommendations' => hotmess_concierge_recommendations($user),
    'prompts' => hotmess_prompt_templates(),
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
