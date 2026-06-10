<?php

declare(strict_types=1);

function hotmess_email_templates(): array
{
    return [
        'welcome_member' => ['subject' => 'Willkommen bei HOTMESS', 'headline' => 'Willkommen bei HOTMESS.', 'intro' => 'Dein Zugang zur HOTMESS Welt ist vorbereitet. Events, Membership, Travel und Concierge wachsen jetzt in einem privaten Erlebnisraum zusammen.', 'ctaLabel' => 'Account öffnen', 'ctaUrl' => '/account'],
        'verify_email' => ['subject' => 'Bestätige deine E-Mail-Adresse', 'headline' => 'Bestätige deine E-Mail-Adresse.', 'intro' => 'Nutze den folgenden Code, um deine HOTMESS E-Mail-Adresse zu bestätigen.', 'ctaLabel' => 'Code eingeben', 'ctaUrl' => '/verify'],
        'password_reset' => ['subject' => 'Passwort zurücksetzen', 'headline' => 'Setze dein Passwort zurück.', 'intro' => 'Du hast eine Änderung deines Passworts angefordert. Falls du das nicht warst, ignoriere diese E-Mail.', 'ctaLabel' => 'Passwort zurücksetzen', 'ctaUrl' => '/login'],
        'ticket_confirmation' => ['subject' => 'Dein HOTMESS Ticket', 'headline' => 'Dein HOTMESS Ticket ist bereit.', 'intro' => 'Dein Zugang wurde bestätigt. Dein Ticket und weitere Hinweise findest du in deinem HOTMESS Account.', 'ctaLabel' => 'Ticket Wallet öffnen', 'ctaUrl' => '/account/tickets'],
        'membership_confirmation' => ['subject' => 'Dein HOTMESS Passport ist aktiv', 'headline' => 'Dein HOTMESS Passport ist aktiv.', 'intro' => 'Deine Membership ist bestätigt. Deine digitale Member Card und aktive Benefits findest du in deinem Account.', 'ctaLabel' => 'Passport ansehen', 'ctaUrl' => '/account/membership'],
        'membership_upgrade' => ['subject' => 'Dein Passport wurde aktualisiert', 'headline' => 'Dein Passport wurde aktualisiert.', 'intro' => 'Dein Membership-Level wurde angepasst. Neue Benefits sind im Account vorbereitet.', 'ctaLabel' => 'Benefits ansehen', 'ctaUrl' => '/account/benefits'],
        'package_inquiry_received' => ['subject' => 'Deine HOTMESS Weekend Anfrage ist eingegangen', 'headline' => 'Deine Weekend Anfrage ist eingegangen.', 'intro' => 'Das HOTMESS Team prüft deine Anfrage und meldet sich mit dem nächsten Concierge-Schritt.', 'ctaLabel' => 'Packages ansehen', 'ctaUrl' => '/packages'],
        'hotel_inquiry_received' => ['subject' => 'Deine Hotelanfrage ist eingegangen', 'headline' => 'Deine Hotelanfrage ist eingegangen.', 'intro' => 'Wir prüfen die passenden Hoteloptionen und Benefits für deinen HOTMESS Aufenthalt.', 'ctaLabel' => 'Hotels ansehen', 'ctaUrl' => '/hotels'],
        'vip_inquiry_received' => ['subject' => 'Deine VIP-Anfrage ist eingegangen', 'headline' => 'Deine VIP-Anfrage ist eingegangen.', 'intro' => 'Deine Anfrage wird vom HOTMESS Host-Team geprüft. VIP- und Table-Optionen werden kuratiert bestätigt.', 'ctaLabel' => 'Events ansehen', 'ctaUrl' => '/events'],
        'partner_application_received' => ['subject' => 'Deine Partneranfrage ist eingegangen', 'headline' => 'Deine Partneranfrage ist eingegangen.', 'intro' => 'Wir prüfen, wie deine Marke in HOTMESS Events, Packages, Membership oder App-Flächen passen kann.', 'ctaLabel' => 'Partnerbereich ansehen', 'ctaUrl' => '/partners'],
        'ambassador_application_received' => ['subject' => 'Deine Ambassador-Bewerbung ist eingegangen', 'headline' => 'Deine Ambassador-Bewerbung ist eingegangen.', 'intro' => 'Wir prüfen deine Bewerbung für den HOTMESS Circle und melden uns mit dem nächsten Schritt.', 'ctaLabel' => 'Ambassador Programm', 'ctaUrl' => '/community/ambassadors'],
        'moderation_warning' => ['subject' => 'Hinweis zu deinem HOTMESS Konto', 'headline' => 'Hinweis zu deinem HOTMESS Konto.', 'intro' => 'Dein Konto wurde verwarnt. Bitte beachte die HOTMESS Regeln, damit der Raum respektvoll und sicher bleibt.', 'ctaLabel' => 'Account öffnen', 'ctaUrl' => '/account/settings'],
        'chat_restriction_notice' => ['subject' => 'Deine Chat-Funktion wurde eingeschränkt', 'headline' => 'Deine Chat-Funktion wurde eingeschränkt.', 'intro' => 'Du kannst bestehende Unterhaltungen lesen, aber aktuell keine neuen Chat-Beiträge senden.', 'ctaLabel' => 'Account-Hinweis ansehen', 'ctaUrl' => '/account/settings'],
        'account_suspension_notice' => ['subject' => 'Hinweis zu deinem Konto', 'headline' => 'Hinweis zu deinem Konto.', 'intro' => 'Dein Konto ist aktuell eingeschränkt oder gesperrt. Wenn du glaubst, dass dies ein Fehler ist, kontaktiere bitte das HOTMESS Team.', 'ctaLabel' => 'Kontakt aufnehmen', 'ctaUrl' => '/contact'],
        'concierge_request_received' => ['subject' => 'Deine Concierge-Anfrage ist eingegangen', 'headline' => 'Deine Concierge-Anfrage ist eingegangen.', 'intro' => 'Deine Anfrage liegt beim HOTMESS Concierge. Wir prüfen den passenden nächsten Schritt für dein Erlebnis.', 'ctaLabel' => 'Concierge öffnen', 'ctaUrl' => '/account/concierge'],
        'loyalty_points_expiry_90' => ['subject' => 'Deine HOTMESS Punkte laufen in 90 Tagen ab', 'headline' => 'Deine Punkte laufen bald ab.', 'intro' => 'Du hast seit längerer Zeit keine Aktivität in deinem HOTMESS Konto. Deine gesammelten Punkte verfallen in 90 Tagen, wenn du keine neue Aktivität zeigst. Jetzt Punkte sichern.', 'ctaLabel' => 'Passport Wallet öffnen', 'ctaUrl' => '/loyalty/wallet'],
        'loyalty_points_expiry_30' => ['subject' => 'Noch 30 Tage — deine HOTMESS Punkte laufen ab', 'headline' => 'Noch 30 Tage.', 'intro' => 'Deine HOTMESS Punkte verfallen in 30 Tagen wegen Inaktivität. Kaufe ein Ticket, buche ein Package oder löse einen Reward ein, um deine Punkte zu erhalten.', 'ctaLabel' => 'Jetzt Punkte sichern', 'ctaUrl' => '/loyalty/wallet'],
        'loyalty_points_expiry_7'  => ['subject' => 'Letzte Warnung — deine Punkte verfallen in 7 Tagen', 'headline' => 'Letzte Chance.', 'intro' => 'In 7 Tagen verfallen deine HOTMESS Punkte. Werde jetzt aktiv und sichere deinen Status.', 'ctaLabel' => 'Passport Wallet öffnen', 'ctaUrl' => '/loyalty/wallet'],
        'loyalty_tier_upgrade'     => ['subject' => 'Du hast einen neuen HOTMESS Status erreicht', 'headline' => 'Status erreicht.', 'intro' => 'Glückwunsch — du hast durch deine Aktivität einen neuen Passport Status erreicht. Neue Rewards und Benefits sind jetzt freigeschaltet.', 'ctaLabel' => 'Wallet öffnen', 'ctaUrl' => '/loyalty/wallet'],
        'loyalty_reward_confirmed' => ['subject' => 'Dein HOTMESS Reward wurde bestätigt', 'headline' => 'Reward bestätigt.', 'intro' => 'Deine Reward-Einlösung wurde vom HOTMESS Team bestätigt. Dein Code ist jetzt aktiv.', 'ctaLabel' => 'Wallet öffnen', 'ctaUrl' => '/loyalty/wallet'],
    ];
}

function hotmess_email_template_labels(): array
{
    return [
        'welcome_member' => 'Willkommen',
        'ticket_confirmation' => 'Ticketbestätigung',
        'membership_confirmation' => 'Membership',
        'package_inquiry_received' => 'Package Anfrage',
        'hotel_inquiry_received' => 'Hotel Anfrage',
        'moderation_warning' => 'Moderationshinweis',
    ];
}

function hotmess_render_email_template(string $templateKey, array $data = []): array
{
    $templates = hotmess_email_templates();
    $template = $templates[$templateKey] ?? $templates['welcome_member'];
    $siteUrl = rtrim((string) (getenv('SITE_URL') ?: (defined('APP_URL') ? APP_URL : 'https://hotmess-blkn.com')), '/');
    $name = trim((string) ($data['name'] ?? ''));
    $detail = trim((string) ($data['detail'] ?? $data['message'] ?? ''));
    $code = trim((string) ($data['code'] ?? ''));
    $ctaUrl = (string) ($data['ctaUrl'] ?? $template['ctaUrl']);
    $absoluteCta = str_starts_with($ctaUrl, 'http') ? $ctaUrl : $siteUrl . '/' . ltrim($ctaUrl, '/');

    $subject = (string) ($data['subject'] ?? $template['subject']);
    $headline = (string) ($data['headline'] ?? $template['headline']);
    $intro = (string) ($data['intro'] ?? $template['intro']);
    $ctaLabel = (string) ($data['ctaLabel'] ?? $template['ctaLabel']);
    $greeting = $name !== '' ? 'Hallo ' . $name . ',' : 'Hallo,';
    $safe = static fn (string $value): string => htmlspecialchars($value, ENT_QUOTES, 'UTF-8');

    $extraHtml = '';
    if ($code !== '') {
        $extraHtml .= '<div style="margin:24px 0;padding:18px 22px;border:1px solid rgba(214,181,109,.38);border-radius:14px;background:#141210;font-size:28px;letter-spacing:.18em;text-align:center;color:#f2d28f;font-weight:800;">' . $safe($code) . '</div>';
    }
    if ($detail !== '') {
        $extraHtml .= '<p style="margin:18px 0 0;color:#cfc7b8;line-height:1.65;">' . nl2br($safe($detail)) . '</p>';
    }

    $html = '<!doctype html><html><body style="margin:0;background:#080706;color:#f7f2ea;font-family:Arial,Helvetica,sans-serif;">'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080706;padding:32px 14px;"><tr><td align="center">'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#11100f;border:1px solid rgba(214,181,109,.22);border-radius:22px;overflow:hidden;">'
        . '<tr><td style="padding:34px 30px 10px;"><div style="font-size:12px;letter-spacing:.22em;color:#d6b56d;font-weight:800;">HOTMESS</div><h1 style="margin:18px 0 12px;font-size:30px;line-height:1.08;color:#fff;">' . $safe($headline) . '</h1>'
        . '<p style="margin:0;color:#d9d2c6;line-height:1.65;">' . $safe($greeting) . '</p><p style="margin:14px 0 0;color:#d9d2c6;line-height:1.65;">' . $safe($intro) . '</p>' . $extraHtml
        . '<p style="margin:26px 0;"><a href="' . $safe($absoluteCta) . '" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#d6b56d;color:#11100f;text-decoration:none;font-weight:800;">' . $safe($ctaLabel) . '</a></p>'
        . '</td></tr><tr><td style="padding:22px 30px 30px;border-top:1px solid rgba(255,255,255,.08);color:#9f978a;font-size:13px;line-height:1.6;">HOTMESS<br/>Erlebnisse. Begegnungen. Erinnerungen.<br/><a href="' . $safe($siteUrl) . '" style="color:#d6b56d;text-decoration:none;">hotmess-blkn.com</a></td></tr>'
        . '</table></td></tr></table></body></html>';

    $textParts = [$headline, '', $greeting, $intro];
    if ($code !== '') {
        $textParts[] = 'Code: ' . $code;
    }
    if ($detail !== '') {
        $textParts[] = $detail;
    }
    $textParts[] = $ctaLabel . ': ' . $absoluteCta;
    $textParts[] = '';
    $textParts[] = 'HOTMESS - Erlebnisse. Begegnungen. Erinnerungen.';

    return ['subject' => $subject, 'html' => $html, 'text' => implode("\n", $textParts)];
}
