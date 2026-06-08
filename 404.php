<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

http_response_code(404);
render_header('Not Found');
?>
<main class="legal-page"><section class="legal-hero"><p class="eyebrow">404</p><h1>This HotMess page is not available.</h1><p>The route may have moved or is still being prepared.</p><a class="button primary" href="/">Back to HotMess</a></section></main>
<?php render_footer(); ?>
