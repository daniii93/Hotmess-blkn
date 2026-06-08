<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/homepage-content.php';

$home = hotmess_homepage_content();

render_header('HOTMESS Erinnerungen');
?>

<main class="home-page">
  <section id="start" class="hero home-hero">
    <div class="hero-image" aria-hidden="true"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <p class="eyebrow"><?= e($home['hero']['eyebrow']) ?></p>
      <h1><?= e($home['hero']['headline']) ?></h1>
      <p class="hero-lead"><?= e($home['hero']['text']) ?></p>
      <div class="hero-actions">
        <?php foreach ($home['hero']['ctas'] as $cta): ?>
          <a class="button <?= e($cta['variant']) ?>" href="<?= e($cta['href']) ?>"><?= e($cta['label']) ?></a>
        <?php endforeach; ?>
      </div>
    </div>
    <aside class="event-card" aria-label="Nächstes HOTMESS Weekend">
      <span><?= e($home['nextWeekend']['city']) ?></span>
      <strong><?= e($home['nextWeekend']['event']) ?></strong>
      <p><?= e($home['nextWeekend']['date']) ?> · kuratiertes Wochenende mit Event, Hoteloptionen und Community-Momenten.</p>
    </aside>
  </section>

  <section id="philosophie" class="intro-section home-section">
    <div class="section-kicker"><?= e($home['philosophy']['eyebrow']) ?></div>
    <div class="intro-grid">
      <h2><?= e($home['philosophy']['title']) ?></h2>
      <div>
        <?php foreach ($home['philosophy']['paragraphs'] as $paragraph): ?>
          <p><?= e($paragraph) ?></p>
        <?php endforeach; ?>
      </div>
    </div>
    <div class="cards home-card-grid four">
      <?php foreach ($home['philosophy']['cards'] as $index => $card): ?>
        <article class="card">
          <span><?= str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT) ?></span>
          <h3><?= e($card['title']) ?></h3>
          <p><?= e($card['text']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="image-band home-feature-band" aria-label="Nächstes HOTMESS Weekend">
    <img src="assets/packages.png" alt="HOTMESS Weekend mit Reise, Hotel und Community" />
    <div class="band-copy">
      <p class="eyebrow"><?= e($home['nextWeekend']['eyebrow']) ?></p>
      <h2><?= e($home['nextWeekend']['title']) ?></h2>
      <p><?= e($home['nextWeekend']['text']) ?></p>
      <div class="hero-actions">
        <?php foreach ($home['nextWeekend']['ctas'] as $cta): ?>
          <a class="button <?= e($cta['variant']) ?>" href="<?= e($cta['href']) ?>"><?= e($cta['label']) ?></a>
        <?php endforeach; ?>
      </div>
    </div>
  </section>

  <section id="cities" class="section home-section">
    <div class="section-heading">
      <p class="eyebrow"><?= e($home['cities']['eyebrow']) ?></p>
      <h2><?= e($home['cities']['title']) ?></h2>
      <p><?= e($home['cities']['text']) ?></p>
    </div>
    <div class="cards home-card-grid three">
      <?php foreach ($home['cities']['items'] as $city): ?>
        <article class="card home-city-card">
          <span><?= e($city['status']) ?></span>
          <h3><?= e($city['city']) ?></h3>
          <p>Eine Destination mit eigener Energie, eigenen Begegnungen und Raum für neue Erinnerungen.</p>
          <a class="button ghost" href="<?= e($city['href']) ?>">Stadt entdecken</a>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section id="weekends" class="section home-section home-split">
    <div>
      <p class="eyebrow"><?= e($home['packages']['eyebrow']) ?></p>
      <h2><?= e($home['packages']['title']) ?></h2>
      <p><?= e($home['packages']['text']) ?></p>
      <a class="button primary" href="<?= e($home['packages']['cta']['href']) ?>"><?= e($home['packages']['cta']['label']) ?></a>
    </div>
    <div class="home-stack">
      <?php foreach ($home['packages']['items'] as $item): ?>
        <article class="home-row-card">
          <h3><?= e($item['title']) ?></h3>
          <p><?= e($item['text']) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section id="passport" class="section home-section">
    <div class="section-heading">
      <p class="eyebrow"><?= e($home['passport']['eyebrow']) ?></p>
      <h2><?= e($home['passport']['title']) ?></h2>
      <?php foreach ($home['passport']['paragraphs'] as $paragraph): ?>
        <p><?= e($paragraph) ?></p>
      <?php endforeach; ?>
    </div>
    <div class="cards home-card-grid three">
      <?php foreach ($home['passport']['tiers'] as $tier): ?>
        <article class="card membership-card">
          <span>Passport</span>
          <h3><?= e($tier['title']) ?></h3>
          <ul class="home-benefit-list">
            <?php foreach ($tier['benefits'] as $benefit): ?>
              <li><?= e($benefit) ?></li>
            <?php endforeach; ?>
          </ul>
        </article>
      <?php endforeach; ?>
    </div>
    <a class="button primary home-centered-cta" href="<?= e($home['passport']['cta']['href']) ?>"><?= e($home['passport']['cta']['label']) ?></a>
  </section>

  <section id="hotels" class="image-band home-feature-band reverse" aria-label="HOTMESS Host Hotels">
    <img src="assets/faq.png" alt="Ausgewähltes HOTMESS Host Hotel" />
    <div class="band-copy">
      <p class="eyebrow"><?= e($home['hotels']['eyebrow']) ?></p>
      <h2><?= e($home['hotels']['title']) ?></h2>
      <p><?= e($home['hotels']['text']) ?></p>
      <div class="home-badges">
        <?php foreach ($home['hotels']['items'] as $item): ?>
          <span><?= e($item['title']) ?></span>
        <?php endforeach; ?>
      </div>
      <a class="button primary" href="<?= e($home['hotels']['cta']['href']) ?>"><?= e($home['hotels']['cta']['label']) ?></a>
    </div>
  </section>

  <section id="circle" class="section home-section home-split">
    <div>
      <p class="eyebrow"><?= e($home['community']['eyebrow']) ?></p>
      <h2><?= e($home['community']['title']) ?></h2>
      <?php foreach ($home['community']['paragraphs'] as $paragraph): ?>
        <p><?= e($paragraph) ?></p>
      <?php endforeach; ?>
      <a class="button primary" href="<?= e($home['community']['cta']['href']) ?>"><?= e($home['community']['cta']['label']) ?></a>
    </div>
    <div class="home-format-grid">
      <?php foreach ($home['community']['formats'] as $format): ?>
        <span><?= e($format) ?></span>
      <?php endforeach; ?>
    </div>
  </section>

  <section id="concierge" class="section home-section home-split home-concierge">
    <div>
      <p class="eyebrow"><?= e($home['concierge']['eyebrow']) ?></p>
      <h2><?= e($home['concierge']['title']) ?></h2>
      <p><?= e($home['concierge']['text']) ?></p>
      <a class="button primary" href="<?= e($home['concierge']['cta']['href']) ?>"><?= e($home['concierge']['cta']['label']) ?></a>
    </div>
    <div class="home-stack">
      <?php foreach ($home['concierge']['actions'] as $action): ?>
        <article class="home-row-card">
          <p><?= e($action) ?></p>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section id="partners" class="section home-section home-quiet-section">
    <div class="section-heading">
      <p class="eyebrow"><?= e($home['partners']['eyebrow']) ?></p>
      <h2><?= e($home['partners']['title']) ?></h2>
      <p><?= e($home['partners']['text']) ?></p>
      <a class="button primary" href="<?= e($home['partners']['cta']['href']) ?>"><?= e($home['partners']['cta']['label']) ?></a>
    </div>
  </section>

  <section id="momente" class="image-band home-feature-band" aria-label="HOTMESS Momente">
    <img src="assets/community-hero.png" alt="HOTMESS Momente und Begegnungen" />
    <div class="band-copy">
      <p class="eyebrow"><?= e($home['gallery']['eyebrow']) ?></p>
      <h2><?= e($home['gallery']['title']) ?></h2>
      <?php foreach ($home['gallery']['paragraphs'] as $paragraph): ?>
        <p><?= e($paragraph) ?></p>
      <?php endforeach; ?>
      <a class="button primary" href="<?= e($home['gallery']['cta']['href']) ?>"><?= e($home['gallery']['cta']['label']) ?></a>
    </div>
  </section>

  <section id="newsletter" class="waitlist-section home-newsletter">
    <div class="waitlist-copy">
      <p class="eyebrow"><?= e($home['newsletter']['eyebrow']) ?></p>
      <h2><?= e($home['newsletter']['title']) ?></h2>
      <p><?= e($home['newsletter']['text']) ?></p>
    </div>
    <form class="waitlist-form" method="post" action="/contact">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
      <input type="hidden" name="inquiry_type" value="general" />
      <input type="hidden" name="subject" value="Eintrag Interesse" />
      <label>
        <?= e($home['newsletter']['fields']['email']) ?>
        <input type="email" name="email" placeholder="name@example.com" required />
      </label>
      <label>
        <?= e($home['newsletter']['fields']['city']) ?>
        <input name="city" placeholder="Innsbruck, Wien, Dubrovnik ..." />
      </label>
      <label>
        <?= e($home['newsletter']['fields']['interest']) ?>
        <select name="message" required>
          <option value="">Bitte auswählen</option>
          <option>Events</option>
          <option>HOTMESS Weekends</option>
          <option>Passport</option>
          <option>Community</option>
          <option>Hotels</option>
        </select>
      </label>
      <input type="hidden" name="name" value="HOTMESS Gast" />
      <button class="button primary" type="submit"><?= e($home['newsletter']['cta']) ?></button>
    </form>
  </section>
</main>

<?php render_footer(); ?>
