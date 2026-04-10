<?php
/**
 * WhatsApp Business Webhook - AgentesVA
 * Twilio BSP | Generado: 2026-04-07
 */
define('TWILIO_AUTH_TOKEN', 'a0b91cddc1d32d2b3013c65f0b2e9655');
define('VERIFY_TOKEN',      'S-PcAnq_vAZ6RFZAw-BpU7ovQQq2deVzKZf69lV29uI');

function wh_log($msg, $type = 'INFO') {
    $log = __DIR__ . '/wa.log';
    file_put_contents($log, '[' . date('Y-m-d H:i:s') . '][' . $type . '] ' . $msg . "\n", FILE_APPEND | LOCK_EX);
}

function validate_twilio_sig($token, $url, $params, $sig) {
    ksort($params);
    $data = $url;
    foreach ($params as $k => $v) $data .= $k . $v;
    return hash_equals(base64_encode(hash_hmac('sha1', $data, $token, true)), $sig);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (
        isset($_GET['hub_mode'], $_GET['hub_challenge'], $_GET['hub_verify_token']) &&
        $_GET['hub_mode'] === 'subscribe' &&
        $_GET['hub_verify_token'] === VERIFY_TOKEN
    ) {
        wh_log('Webhook verificado OK');
        echo $_GET['hub_challenge'];
        exit;
    }
    http_response_code(403);
    wh_log('Verificacion fallida: token invalido', 'ERROR');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $sig = $_SERVER['HTTP_X_TWILIO_SIGNATURE'] ?? '';
    if ($sig) {
        $url = 'https://agentesva.com/wh/wa.php';
        if (!validate_twilio_sig(TWILIO_AUTH_TOKEN, $url, $_POST, $sig)) {
            http_response_code(403);
            wh_log('Firma Twilio invalida', 'SECURITY');
            exit;
        }
    }
    if (isset($_POST['From']) && strpos($_POST['From'], 'whatsapp:') === 0) {
        $from = str_replace('whatsapp:', '', $_POST['From']);
        $body = $_POST['Body'] ?? '(sin texto)';
        $sid  = $_POST['MessageSid'] ?? 'unknown';
        wh_log("Mensaje de $from: $body [SID: $sid]");
        http_response_code(200);
        header('Content-Type: text/xml');
        echo '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
        exit;
    }
    http_response_code(200);
    echo json_encode(['status' => 'ok']);
}
?>
