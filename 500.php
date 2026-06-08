<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

http_response_code(500);
render_header('Server Error');
?>
<main class="legal-page"><section class="legal-hero"><p class="eyebrow">500</p><h1>HotMess is handling a platform issue.</h1><p>Operations and monitoring structures are prepared for production escalation.</p><a class="button primary" href="/status">System Status</a></section></main>
<?php render_footer(); ?>
