<?php
/**
 * AgentesVA — Brevo subscription proxy
 * Keeps the API key server-side and out of client-visible source code.
 *
 * POST /api/subscribe.php
 * Body (JSON): { "email": "user@example.com", "name": "Optional Name" }
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://agentesva.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Config ────────────────────────────────────────────────
// Store this key in an .env file or cPanel Environment Variables,
// NOT directly in this file. Example .env line:
//   BREVO_API_KEY=xkeysib-...
// Then read with: getenv('BREVO_API_KEY')
//
// For now it reads from an env var set in SiteGround's cPanel
// (Software → PHP Variables, or .env via Softaculous).
$apiKey  = getenv('BREVO_API_KEY') ?: '';
$listId  = (int)(getenv('BREVO_LIST_ID') ?: 8);

if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'Server misconfiguration']);
    exit;
}

// ── Input validation ──────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

$email = trim((string)($body['email'] ?? ''));
$name  = trim((string)($body['name']  ?? ''));

if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Limit name length
$name = mb_substr($name, 0, 100);

// ── Call Brevo API ────────────────────────────────────────
$payload = [
    'email'            => $email,
    'listIds'          => [$listId],
    'updateEnabled'    => true,
];
if ($name !== '') {
    $parts = explode(' ', $name, 2);
    $payload['attributes'] = [
        'FIRSTNAME' => $parts[0],
        'LASTNAME'  => $parts[1] ?? '',
    ];
}

$ch = curl_init('https://api.brevo.com/v3/contacts');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($payload),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Accept: application/json',
        'api-key: ' . $apiKey,
    ],
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(502);
    echo json_encode(['error' => 'Upstream connection failed']);
    exit;
}

// Brevo returns 201 (created) or 204 (already exists + updated)
if ($httpCode === 201 || $httpCode === 204) {
    http_response_code(200);
    echo json_encode(['success' => true]);
} else {
    $upstream = json_decode($response, true);
    $msg = $upstream['message'] ?? 'Subscription failed';
    http_response_code($httpCode >= 400 ? $httpCode : 500);
    echo json_encode(['error' => $msg]);
}
