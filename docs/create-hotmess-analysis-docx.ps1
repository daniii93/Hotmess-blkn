$ErrorActionPreference = 'Stop'

$docPath = Join-Path (Get-Location) 'docs\HotMess-Webseitenanalyse-2026-06-08.docx'
$tempRoot = Join-Path $env:TEMP ('hotmess-docx-' + [guid]::NewGuid().ToString('N'))

New-Item -ItemType Directory -Path $tempRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot '_rels') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot 'word') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot 'word\_rels') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot 'docProps') | Out-Null

function Escape-Xml([string]$text) {
    if ($null -eq $text) {
        return ''
    }

    return [System.Security.SecurityElement]::Escape($text)
}

function Add-Paragraph([string]$text, [string]$style = 'Normal') {
    $styleXml = ''
    if ($style -ne 'Normal') {
        $styleXml = '<w:pPr><w:pStyle w:val="' + (Escape-Xml $style) + '"/></w:pPr>'
    }

    return '<w:p>' + $styleXml + '<w:r><w:t xml:space="preserve">' + (Escape-Xml $text) + '</w:t></w:r></w:p>'
}

function Add-Bullet([string]$text) {
    return '<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t xml:space="preserve">' + (Escape-Xml $text) + '</w:t></w:r></w:p>'
}

function Add-Cell([string]$text) {
    return '<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr><w:p><w:r><w:t xml:space="preserve">' + (Escape-Xml $text) + '</w:t></w:r></w:p></w:tc>'
}

function Add-HeaderCell([string]$text) {
    return '<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:shd w:val="clear" w:color="auto" w:fill="E5C38C"/></w:tcPr><w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">' + (Escape-Xml $text) + '</w:t></w:r></w:p></w:tc>'
}

function Add-Table([string[]]$headers, [object[]]$rows) {
    $xml = '<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="3A332D"/><w:left w:val="single" w:sz="4" w:color="3A332D"/><w:bottom w:val="single" w:sz="4" w:color="3A332D"/><w:right w:val="single" w:sz="4" w:color="3A332D"/><w:insideH w:val="single" w:sz="4" w:color="3A332D"/><w:insideV w:val="single" w:sz="4" w:color="3A332D"/></w:tblBorders></w:tblPr>'
    $xml += '<w:tr>' + (($headers | ForEach-Object { Add-HeaderCell $_ }) -join '') + '</w:tr>'

    foreach ($row in $rows) {
        $xml += '<w:tr>'
        foreach ($header in $headers) {
            $xml += Add-Cell ([string]$row.$header)
        }
        $xml += '</w:tr>'
    }

    return $xml + '</w:tbl>'
}

function Add-PageBreak {
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
}

$publicPages = @(
    [pscustomobject]@{ Page = 'Startseite'; Route = '/'; Status = 'Vollstaendig funktionsfaehig'; Assessment = 'Hero, Waitlist, Navigation und Markenauftritt vorhanden.' },
    [pscustomobject]@{ Page = 'Events'; Route = '/events, /events/[slug]'; Status = 'Teilweise funktionsfaehig'; Assessment = 'Listing, Filter, Detailseiten und CTAs vorhanden; echte Ticketprovider-Anbindung offen.' },
    [pscustomobject]@{ Page = 'Tickets'; Route = '/tickets'; Status = 'Teilweise funktionsfaehig'; Assessment = 'Ticketarten, Sales- und Referral-Struktur vorhanden; Payment/Checkout offen.' },
    [pscustomobject]@{ Page = 'Hotels & Travel'; Route = '/hotels, /hotels/[slug], /travel'; Status = 'Vorbereitet aber nicht fertig'; Assessment = 'Hotel- und Travel-Seiten vorhanden; Buchung/API noch Mock-/Platzhalterlogik.' },
    [pscustomobject]@{ Page = 'Packages / Weekends'; Route = '/packages, /packages/[slug]'; Status = 'Teilweise funktionsfaehig'; Assessment = 'Package-Listen, Details und Inquiry-Flows vorhanden; Direktbuchung offen.' },
    [pscustomobject]@{ Page = 'Community'; Route = '/community, /community/ambassadors'; Status = 'Vorbereitet aber nicht fertig'; Assessment = 'Community- und Ambassador-Struktur vorhanden; echte Bewerbung/Registrierung ausbauen.' },
    [pscustomobject]@{ Page = 'Membership / Passport'; Route = '/membership, /membership/plus, /membership/black'; Status = 'Vorbereitet aber nicht fertig'; Assessment = 'Tiers, Benefits und Member Card vorhanden; Stripe-Subscription offen.' },
    [pscustomobject]@{ Page = 'App / HotMess Guide'; Route = '/app und /app/*'; Status = 'Vorbereitet aber nicht fertig'; Assessment = 'PWA-/Guide-Struktur vorhanden; Push, Wallet und native App nicht produktiv.' },
    [pscustomobject]@{ Page = 'Partner & Sponsors'; Route = '/partners und Unterseiten'; Status = 'Teilweise funktionsfaehig'; Assessment = 'B2B-Portal, Apply, Analytics und Campaigns vorhanden; CRM/Metriken offen.' },
    [pscustomobject]@{ Page = 'Gallery / Media'; Route = '/gallery, /gallery/photos, /gallery/videos, /gallery/[slug]'; Status = 'Teilweise funktionsfaehig'; Assessment = 'Galerie, Filter und Detailseiten vorhanden; Upload/Medienverwaltung offen.' },
    [pscustomobject]@{ Page = 'Contact / Inquiries'; Route = '/contact'; Status = 'Teilweise funktionsfaehig'; Assessment = 'Inquiry-Formulare vorhanden; echte E-Mail/CRM-Anbindung offen.' },
    [pscustomobject]@{ Page = 'Legal / Status'; Route = '/legal/*, /status, /maintenance'; Status = 'Vorbereitet aber nicht fertig'; Assessment = 'Rechtliche Struktur vorhanden; finale Rechtspruefung notwendig.' }
)

$protectedPages = @(
    [pscustomobject]@{ Area = 'Account'; Route = '/account und /account/*'; Status = 'Teilweise funktionsfaehig'; Description = 'Kundenkonto mit Membership, Tickets, Events, Hotels, Packages, Benefits, Rewards, Referrals, Concierge und Settings. Viele Aktionen sind Platzhalter.' },
    [pscustomobject]@{ Area = 'Chat'; Route = '/chat, /chat/[id]'; Status = 'Teilweise funktionsfaehig'; Description = 'Serverseitiger Mitglieder-Chat mit Direktchats, Status, Medienvorbereitung, Melden, Snapshots, Audit und Screenshot-API. Realtime/Push offen.' },
    [pscustomobject]@{ Area = 'Admin Dashboard'; Route = '/admin und /admin/*'; Status = 'Teilweise funktionsfaehig'; Description = 'Control Center fuer Events, Hotels, Packages, Community, Membership, App, Partner, Inquiries, CRM, Loyalty, Revenue und Settings. Finales CRUD offen.' },
    [pscustomobject]@{ Area = 'Admin Chat Safety'; Route = '/admin/chat/*'; Status = 'Teilweise funktionsfaehig'; Description = 'Reports, Snapshots, Audit-Log und Moderationsaktionen vorbereitet.' },
    [pscustomobject]@{ Area = 'Sales / Partnervertrieb'; Route = '/admin-sales.php, /partner-dashboard.php'; Status = 'Teilweise funktionsfaehig'; Description = 'Event-Vertrieb, Partnerlinks und Commission-Struktur vorhanden; Auszahlung/Abrechnung offen.' }
)

$forms = @(
    [pscustomobject]@{ Form = 'Login'; Page = '/login'; Status = 'Vollstaendig funktionsfaehig'; Notes = 'E-Mail/Passwort, CSRF und Session-Login vorhanden.' },
    [pscustomobject]@{ Form = 'Registrierung'; Page = '/register'; Status = 'Teilweise funktionsfaehig'; Notes = 'Registrierung und Verifikation vorhanden; Provider-Versand abhaengig von Konfiguration.' },
    [pscustomobject]@{ Form = 'Kontakt / General Inquiry'; Page = '/contact'; Status = 'Teilweise funktionsfaehig'; Notes = 'Validierung und Inquiry-Modell vorhanden; CRM/E-Mail offen.' },
    [pscustomobject]@{ Form = 'Package Inquiry'; Page = '/packages/[slug], /account/packages'; Status = 'Teilweise funktionsfaehig'; Notes = 'Anfragetypen und Datenmodell vorhanden; Direktbuchung offen.' },
    [pscustomobject]@{ Form = 'Hotel Inquiry'; Page = '/hotels/[slug]'; Status = 'Vorbereitet aber nicht fertig'; Notes = 'Hotelanfrage vorbereitet; Hotel-API/Buchung offen.' },
    [pscustomobject]@{ Form = 'VIP / Table Inquiry'; Page = '/tickets, /events/[slug]'; Status = 'Vorbereitet aber nicht fertig'; Notes = 'Anfrage-Workflow vorbereitet; operatives Follow-up offen.' },
    [pscustomobject]@{ Form = 'Partner Application'; Page = '/partners/apply'; Status = 'Teilweise funktionsfaehig'; Notes = 'Bewerbungsfelder vorhanden; CRM/Benachrichtigung offen.' },
    [pscustomobject]@{ Form = 'Ambassador Application'; Page = '/community/ambassadors'; Status = 'Vorbereitet aber nicht fertig'; Notes = 'Ambassador-Inhalte vorhanden; Review-Prozess ausbauen.' },
    [pscustomobject]@{ Form = 'Admin Forms'; Page = '/admin/*'; Status = 'Teilweise funktionsfaehig'; Notes = 'Viele Formulare sind UI-/Mock-Verwaltung statt finalem CRUD.' },
    [pscustomobject]@{ Form = 'Chat Forms'; Page = '/chat'; Status = 'Teilweise funktionsfaehig'; Notes = 'Senden, Medien, Reports und Aktionen vorhanden; Realtime offen.' }
)

$buttons = @(
    [pscustomobject]@{ Area = 'Navigation'; Example = 'Events, Tickets, Hotels & Reisen, Weekends, Community, Passport, App, Partner, Galerie, Konto, Admin, Chat'; Status = 'Vollstaendig funktionsfaehig'; Note = 'Aktiver Menuepunkt funktioniert; /travel hat keinen eigenen aktiven Top-Nav-Zustand.' },
    [pscustomobject]@{ Area = 'CTA Buttons'; Example = 'Tickets ansehen, Hotel buchen, Package ansehen, Mitglied werden'; Status = 'Teilweise funktionsfaehig'; Note = 'Meist interne Navigation oder Anfrageanker; externe Provider offen.' },
    [pscustomobject]@{ Area = 'Account'; Example = 'Upgrade Passport, Open HotMess Guide, Download vorbereitet, Apple Wallet vorbereitet'; Status = 'Vorbereitet aber nicht fertig'; Note = 'Einige Buttons sind bewusst disabled oder Platzhalter.' },
    [pscustomobject]@{ Area = 'Chat'; Example = 'Neuer Chat, Fixieren, Stummschalten, Loeschen, Melden'; Status = 'Teilweise funktionsfaehig'; Note = 'Nutzerspezifische Aktionen vorhanden; Realtime-Sync offen.' },
    [pscustomobject]@{ Area = 'Admin'; Example = 'Quick Actions, Bearbeiten, Status aendern, Modulfilter'; Status = 'Teilweise funktionsfaehig'; Note = 'Viele Aktionen sind Verwaltungsoberflaeche ohne finale Datenbankaktion.' },
    [pscustomobject]@{ Area = 'Partner'; Example = 'Become a Partner, Kampagnen, Analytics, Referrals'; Status = 'Teilweise funktionsfaehig'; Note = 'Lead- und Kampagnenlogik vorbereitet; echte Messung offen.' }
)

$workflows = @(
    [pscustomobject]@{ Workflow = 'Besucher informiert sich ueber Events'; Status = 'Vollstaendig funktionsfaehig'; Result = 'Events, Details, Galerie, Membership- und App-CTAs sichtbar.' },
    [pscustomobject]@{ Workflow = 'Ticketkauf'; Status = 'Vorbereitet aber nicht fertig'; Result = 'Ticketarten und Sales-/Referral-Struktur vorhanden; Checkout und Payment offen.' },
    [pscustomobject]@{ Workflow = 'Package anfragen'; Status = 'Teilweise funktionsfaehig'; Result = 'Formular und Inquiry-Datenmodell vorhanden; CRM/E-Mail offen.' },
    [pscustomobject]@{ Workflow = 'Registrierung und Verifizierung'; Status = 'Teilweise funktionsfaehig'; Result = 'User-, Status- und Verifikationslogik vorhanden; Provider abhaengig.' },
    [pscustomobject]@{ Workflow = 'Login und Kundenkonto'; Status = 'Teilweise funktionsfaehig'; Result = 'Accountbereiche erreichbar; viele Kundenaktionen Platzhalter.' },
    [pscustomobject]@{ Workflow = 'Mitglieder-Chat'; Status = 'Teilweise funktionsfaehig'; Result = 'Direktchat, Reports, Snapshots und Audit vorbereitet; Realtime/Push offen.' },
    [pscustomobject]@{ Workflow = 'Admin verwaltet Plattform'; Status = 'Teilweise funktionsfaehig'; Result = 'Adminmodule breit ausgebaut; finales CRUD priorisieren.' },
    [pscustomobject]@{ Workflow = 'Partner bewirbt sich und trackt Performance'; Status = 'Vorbereitet aber nicht fertig'; Result = 'Apply, Analytics, Campaigns und Referrals vorhanden; echte Metriken offen.' }
)

$technical = @(
    [pscustomobject]@{ Category = 'PHP Syntax'; Status = 'Vollstaendig funktionsfaehig'; Finding = '130 PHP-Dateien mit .tools/php/php.exe -l geprueft, keine Syntaxfehler.' },
    [pscustomobject]@{ Category = 'Routing'; Status = 'Teilweise funktionsfaehig'; Finding = '.htaccess enthaelt Clean-Routes und Schutzregeln. /travel ohne aktiven Top-Nav-Marker.' },
    [pscustomobject]@{ Category = 'Frontend / Konsole'; Status = 'Vollstaendig funktionsfaehig'; Finding = 'Live-Smokecheck auf 17 Kernrouten ohne Browser-Konsolenfehler.' },
    [pscustomobject]@{ Category = 'Datenbasis'; Status = 'Vorbereitet aber nicht fertig'; Finding = 'Zentrale PHP-Datenmodule vorhanden; viele Bereiche weiterhin Mock-/Fallback-Daten.' },
    [pscustomobject]@{ Category = 'Supabase / Stripe / Resend'; Status = 'Vorbereitet aber nicht fertig'; Finding = 'Strukturen und ENV-Hinweise vorhanden; echte Provider nicht final konfiguriert.' },
    [pscustomobject]@{ Category = 'Sicherheit'; Status = 'Teilweise funktionsfaehig'; Finding = 'CSRF, Adminschutz, Loginpflicht, .htaccess-Sperren, Chat-Audit und Reports vorhanden. Rate Limits/Legal offen.' },
    [pscustomobject]@{ Category = 'SEO'; Status = 'Teilweise funktionsfaehig'; Finding = 'SEO-Helper, Canonical, OG, Schema, Sitemap und Robots vorbereitet.' },
    [pscustomobject]@{ Category = 'Mobile / UI'; Status = 'Teilweise funktionsfaehig'; Finding = 'Responsive CSS und Motion-Layer vorhanden; vollstaendige Device-QA bleibt offen.' }
)

$missing = @(
    [pscustomobject]@{ Area = 'Payments'; Feature = 'Stripe Checkout / Subscription / Ticket Payment'; Priority = 'Hoch'; Effort = 'Mittel bis hoch'; Description = 'Ticketkauf, Membership und Packages brauchen echte Zahlungsfluesse, Webhooks und Statusupdates.' },
    [pscustomobject]@{ Area = 'Ticketing'; Feature = 'Ticketprovider, QR-Tickets, Wallet'; Priority = 'Hoch'; Effort = 'Mittel'; Description = 'Provider, QR-Code-Validierung und Wallet-Download finalisieren.' },
    [pscustomobject]@{ Area = 'Inquiries / CRM'; Feature = 'E-Mail/CRM-Weiterleitung und Follow-up'; Priority = 'Hoch'; Effort = 'Mittel'; Description = 'Anfragen speichern, benachrichtigen, zuweisen und bearbeiten.' },
    [pscustomobject]@{ Area = 'Admin CRUD'; Feature = 'Produktive Bearbeitung aller Module'; Priority = 'Hoch'; Effort = 'Hoch'; Description = 'Admin UI final mit Create/Edit/Delete/Publish je Modul verbinden.' },
    [pscustomobject]@{ Area = 'Auth'; Feature = 'Passwort vergessen, Rollen, Member-Freigabe'; Priority = 'Hoch'; Effort = 'Mittel'; Description = 'Recovery, Rollenmatrix und Freigabeprozesse produktionsreif machen.' },
    [pscustomobject]@{ Area = 'Chat'; Feature = 'Realtime, Push, Storage, Blockieren, Moderation'; Priority = 'Mittel bis hoch'; Effort = 'Hoch'; Description = 'Echtzeit, Notifications, Storage und klare Moderationsentscheidungen anbinden.' },
    [pscustomobject]@{ Area = 'Partner / Revenue'; Feature = 'Metriken, Commission Payouts, Sponsor Billing'; Priority = 'Mittel'; Effort = 'Mittel bis hoch'; Description = 'Echte Tracking- und Abrechnungsdaten fehlen.' },
    [pscustomobject]@{ Area = 'Legal'; Feature = 'DSGVO, Impressum, AGB, Cookie Consent'; Priority = 'Hoch'; Effort = 'Mittel'; Description = 'Rechtliche Seiten final pruefen und Consent-Prozess anschliessen.' },
    [pscustomobject]@{ Area = 'Testing'; Feature = 'Automatisierte Tests'; Priority = 'Mittel'; Effort = 'Mittel'; Description = 'Funktionale Tests, Formular-/API-Tests und responsive Screenshot-Tests fehlen.' },
    [pscustomobject]@{ Area = 'Navigation'; Feature = 'Travel Active State'; Priority = 'Niedrig'; Effort = 'Niedrig'; Description = '/travel sollte Hotels & Reisen aktiv markieren oder als eigener Navigationspunkt erscheinen.' }
)

$roadmap = @(
    [pscustomobject]@{ Step = '1'; Item = 'Produktionsdatenbank und Provider konfigurieren'; Priority = 'Hoch'; Benefit = 'Stabile Grundlage fuer echte Nutzer, Anfragen, Tickets und Admin-CRUD.'; Effort = 'Mittel' },
    [pscustomobject]@{ Step = '2'; Item = 'Ticket-/Payment-Flow finalisieren'; Priority = 'Hoch'; Benefit = 'Direkte Monetarisierung ueber Tickets, VIP und Membership.'; Effort = 'Hoch' },
    [pscustomobject]@{ Step = '3'; Item = 'Inquiry-CRM und Benachrichtigungen anbinden'; Priority = 'Hoch'; Benefit = 'Keine Leads verlieren; operative Steuerung.'; Effort = 'Mittel' },
    [pscustomobject]@{ Step = '4'; Item = 'Admin CRUD pro Hauptmodul finalisieren'; Priority = 'Hoch'; Benefit = 'Inhalte produktiv pflegen statt Mockdaten nutzen.'; Effort = 'Hoch' },
    [pscustomobject]@{ Step = '5'; Item = 'Chat Realtime, Push und Moderation produktionsreif machen'; Priority = 'Mittel bis hoch'; Benefit = 'Starker Member-Mehrwert mit kontrollierter Sicherheit.'; Effort = 'Hoch' },
    [pscustomobject]@{ Step = '6'; Item = 'Partner- und Revenue-Tracking aktivieren'; Priority = 'Mittel'; Benefit = 'Messbare Sponsoring- und Vertriebsumsaetze.'; Effort = 'Mittel' },
    [pscustomobject]@{ Step = '7'; Item = 'Rechtliche Finalisierung und Consent'; Priority = 'Hoch'; Benefit = 'DSGVO- und Produktionssicherheit.'; Effort = 'Mittel' },
    [pscustomobject]@{ Step = '8'; Item = 'Automatisierte QA einfuehren'; Priority = 'Mittel'; Benefit = 'Schnellere Weiterentwicklung ohne Regressionen.'; Effort = 'Mittel' },
    [pscustomobject]@{ Step = '9'; Item = 'Mobile Device QA und Performance-Feinschliff'; Priority = 'Mittel'; Benefit = 'Premium-Erlebnis auf iPhone, Android und Tablet.'; Effort = 'Mittel' },
    [pscustomobject]@{ Step = '10'; Item = 'Content, Medien und echte Partnerdaten ersetzen Mockdaten'; Priority = 'Niedrig bis mittel'; Benefit = 'Markenwirkung und Glaubwuerdigkeit steigen.'; Effort = 'Mittel' }
)

$body = ''
$body += Add-Paragraph 'HOTMESS BLKN' 'Title'
$body += Add-Paragraph 'Vollstaendige Webseitenanalyse und technische Dokumentation' 'Subtitle'
$body += Add-Paragraph 'Analyse-Datum: 08.06.2026'
$body += Add-Paragraph 'Projektpfad: C:\Users\PC\Documents\Webseite'
$body += Add-Paragraph 'Live-Domain: hotmess-blkn.app'
$body += Add-Paragraph 'Zweck: Dokumentation des aktuellen Funktionsstands, Identifikation offener Punkte und priorisierte Weiterentwicklung.'
$body += Add-PageBreak
$body += Add-Paragraph 'Inhaltsverzeichnis' 'Heading1'
@('Projektuebersicht','Zusammenfassung','Webseitenstruktur','Seitenanalyse','Funktionsanalyse','Buttonanalyse','Formularanalyse','Workflowanalyse','Technische Analyse','Fehlerliste','Fehlende und offene Funktionen','Verbesserungsvorschlaege','Entwicklungsroadmap','Fazit') | ForEach-Object { $body += Add-Bullet $_ }
$body += Add-PageBreak
$body += Add-Paragraph 'Projektuebersicht' 'Heading1'
$body += Add-Paragraph 'HotMess BLKN ist aktuell als PHP-basierte Premium-Plattform fuer Events, Tickets, Hotels & Travel, Packages, Community, Membership, App/Guide, Partner, Gallery, Account, Admin, Chat, CRM und Revenue aufgebaut. Die Marke wirkt bewusst dunkel, luxurioes, wild und auffaellig. Die technische Struktur ist umfangreich vorbereitet, viele Bereiche nutzen jedoch weiterhin Mock-/Fallback-Daten oder UI-Platzhalter.'
$body += Add-Paragraph 'Zusammenfassung' 'Heading1'
@(
    'Die oeffentliche Plattform ist breit nutzbar und auf den wichtigsten Routen live erreichbar.',
    'Admin, Account, Partnerportal, Chat, CRM, Loyalty und Revenue sind strukturell vorhanden, aber in vielen Bereichen noch nicht vollstaendig produktiv angebunden.',
    'PHP-Lint: 130 Dateien geprueft, keine Syntaxfehler.',
    'Live-Smokecheck: 17 Kernrouten geprueft, keine Browser-Konsolenfehler festgestellt.',
    'Hauptluecken: Payment, Ticketprovider, echte CRUD-Verwaltung, CRM/E-Mail-Automation, Realtime/Push, rechtliche Finalisierung und automatisierte Tests.'
) | ForEach-Object { $body += Add-Bullet $_ }
$body += Add-Paragraph 'Webseitenstruktur' 'Heading1'
$body += Add-Paragraph 'Die .htaccess enthaelt Rewrite-Regeln fuer oeffentliche Seiten, Detailseiten, Account-Unterseiten, Admin-Module, Partner-Unterseiten, Chat-Routen und API-Endpunkte. Oeffentliche Kernseiten bleiben ohne Login erreichbar; Account, Chat und Admin nutzen serverseitige Zugriffsfunktionen.'
$body += Add-Paragraph 'Seitenanalyse - oeffentliche Bereiche' 'Heading1'
$body += Add-Table @('Page','Route','Status','Assessment') $publicPages
$body += Add-Paragraph 'Seitenanalyse - geschuetzte und operative Bereiche' 'Heading1'
$body += Add-Table @('Area','Route','Status','Description') $protectedPages
$body += Add-Paragraph 'Funktionsanalyse' 'Heading1'
@(
    'Navigation: Hauptnavigation funktioniert, aktueller Bereich wird markiert. Ausnahme: /travel ist erreichbar, aber nicht als eigener aktiver Top-Menuepunkt markiert.',
    'SEO: zentrale SEO-Funktionen, Open Graph, Canonical, Schema, Sitemap und Robots sind vorbereitet.',
    'Mock-/Datenmodule: Events, Hotels, Packages, Gallery, Membership, Partner, App, Account, CRM, Revenue und Inquiries nutzen zentrale PHP-Datenmodule.',
    'Auth: Login, Rollenpruefung, Adminschutz, CSRF und Member-Statusfunktionen vorhanden.',
    'Chat: Direktchat, Statuslogik, Medienvorbereitung, Melden, Moderationssnapshots, Audit-Log und Screenshot-Event-API vorhanden.',
    'Admin: sehr breite Verwaltungsoberflaeche vorhanden; viele Buttons und Formulare sind noch UI-/Mock-Funktionen statt finalem CRUD.'
) | ForEach-Object { $body += Add-Bullet $_ }
$body += Add-Paragraph 'Buttonanalyse' 'Heading1'
$body += Add-Table @('Area','Example','Status','Note') $buttons
$body += Add-Paragraph 'Formularanalyse' 'Heading1'
$body += Add-Table @('Form','Page','Status','Notes') $forms
$body += Add-Paragraph 'Workflowanalyse' 'Heading1'
$body += Add-Table @('Workflow','Status','Result') $workflows
$body += Add-Paragraph 'Technische Analyse' 'Heading1'
$body += Add-Table @('Category','Status','Finding') $technical
$body += Add-Paragraph 'Fehlerliste' 'Heading1'
@(
    'Keine PHP-Syntaxfehler in 130 geprueften PHP-Dateien.',
    'Keine Browser-Konsolenfehler auf den live geprueften Kernrouten.',
    'Auffaelligkeit: /travel besitzt keinen aktiven Top-Navigationszustand.',
    'Viele sichtbare Admin-/Account-Aktionen sind als Platzhalter oder vorbereitete Funktion beschriftet.',
    'Migration-, Debug-, Reset- und Testskripte existieren; .htaccess blockiert sie. Operative Empfehlung: nicht benoetigte Skripte nach Migration entfernen.'
) | ForEach-Object { $body += Add-Bullet $_ }
$body += Add-Paragraph 'Fehlende und offene Funktionen' 'Heading1'
$body += Add-Table @('Area','Feature','Priority','Effort','Description') $missing
$body += Add-Paragraph 'Verbesserungsvorschlaege' 'Heading1'
@(
    'UX: Platzhalteraktionen im Account/Admin klarer als vorbereitet kennzeichnen oder final anbinden.',
    'UI: Motion-Ebene regelmaessig auf Lesbarkeit und mobile Stabilitaet pruefen.',
    'Conversion: Ticket-, Package-, Hotel- und VIP-CTAs an echte Provider oder klare Concierge-Flows anschliessen.',
    'Performance: Bildgroessen und Caching-Strategie je Asset pruefen; Lazy Loading fuer grosse Medienflaechen konsistent einsetzen.',
    'SEO: Detailseiten mit echten Produktionsdaten und finalen OG-Bildern versorgen.',
    'Mobile: iOS Safari, Android Chrome, Samsung Internet und Tablet-Layouts per Screenshot-Test pruefen.',
    'Security: Rate Limiting, Audit Logs, Datenexport/Loeschung, Provider-Secrets, Backups und Rechtspruefung finalisieren.'
) | ForEach-Object { $body += Add-Bullet $_ }
$body += Add-Paragraph 'Entwicklungsroadmap' 'Heading1'
$body += Add-Table @('Step','Item','Priority','Benefit','Effort') $roadmap
$body += Add-Paragraph 'Fazit' 'Heading1'
$body += Add-Paragraph 'HotMess BLKN besitzt bereits eine breite Plattformstruktur: oeffentliche Premium-Seiten, Admin Control Center, Account, Chat, Partner, CRM, Loyalty und Revenue sind konzeptionell und visuell weit fortgeschritten. Der wichtigste naechste Schritt ist nicht weiteres UI-Wachstum, sondern die produktive Verankerung: echte Datenbankprozesse, Payment, Ticketing, Inquiry-CRM, Admin-CRUD, Provider-Integrationen, Datenschutz und automatisierte QA. Danach kann die Plattform belastbar als Event-, Travel-, Membership- und Community-System betrieben werden.'

$documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + $body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="850" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>'
$stylesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="21"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="C99655"/><w:sz w:val="52"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:color w:val="741F28"/><w:sz w:val="30"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:before="360" w:after="160"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:color w:val="C99655"/><w:sz w:val="34"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720"/></w:pPr></w:style><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr></w:style></w:styles>'
$numberingXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="*"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num></w:numbering>'
$contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>'
$rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>'
$docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/></Relationships>'
$core = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>HotMess Webseitenanalyse</dc:title><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-08T00:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-08T00:00:00Z</dcterms:modified></cp:coreProperties>'
$app = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Codex</Application></Properties>'

Set-Content -LiteralPath (Join-Path $tempRoot '[Content_Types].xml') -Value $contentTypes -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot '_rels\.rels') -Value $rels -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot 'word\document.xml') -Value $documentXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot 'word\styles.xml') -Value $stylesXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot 'word\numbering.xml') -Value $numberingXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot 'word\_rels\document.xml.rels') -Value $docRels -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot 'docProps\core.xml') -Value $core -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tempRoot 'docProps\app.xml') -Value $app -Encoding UTF8

if (Test-Path $docPath) {
    Remove-Item -LiteralPath $docPath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempRoot, $docPath)
Remove-Item -LiteralPath $tempRoot -Recurse -Force
Get-Item $docPath | Select-Object FullName,Length,LastWriteTime
