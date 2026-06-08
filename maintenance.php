<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

render_header('Maintenance');
?>
<main class="legal-page maintenance-page">
  <section class="legal-hero">
    <p class="eyebrow">Maintenance</p>
    <h1>HotMess is preparing the next chapter.</h1>
    <p>This page is prepared for planned maintenance windows. Public pages remain active until maintenance mode is explicitly enabled.</p>
    <a class="button primary" href="/">Back to HotMess</a>
  </section>
</main>
<?php render_footer(); ?>
