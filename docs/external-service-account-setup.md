# HOTMESS External Service Account Setup

Diese Checkliste bereitet externe Standarddienste fuer HOTMESS vor. Es werden keine kostenpflichtigen Abos gebucht, keine Zahlungsdaten hinterlegt und keine Live-Keys in den Code eingetragen.

## Grundregeln

- Primaere technische Account-E-Mail: `tech@hotmess-blkn.app`
- Falls `tech@hotmess-blkn.app` noch nicht existiert: zuerst diese technische E-Mail-Adresse anlegen.
- Alternative: `admin@hotmess-blkn.app` oder eine bestehende Geschaeftsadresse.
- Keine privaten Entwicklerkonten als Hauptkonto verwenden, wenn moeglich.
- API Keys niemals in Git committen.
- `.env` muss in `.gitignore` bleiben.
- Keine Screenshots mit API Keys teilen.
- Service Role Keys nur serverseitig nutzen.
- API Keys regelmaessig rotieren.
- Zwei-Faktor-Authentifizierung aktivieren.
- Recovery-E-Mail hinterlegen.
- Zugriff nur fuer notwendige Personen vergeben.

## Firebase / Google Firebase

Registrierung:

- https://firebase.google.com/
- https://console.firebase.google.com/

Zweck fuer HOTMESS:

- Push Notifications
- Web Push Zertifikat
- spaeter optionale App-/PWA-Signale

Empfohlene Account-E-Mail:

- `tech@hotmess-blkn.app`

Registrierungsdaten:

- Google Account
- Projektname
- optional Organisation / Unternehmen

Kostenloser Plan:

- Firebase Spark Plan reicht fuer Vorbereitung und erste Tests.

Zahlungsdaten:

- Nicht noetig, solange keine kostenpflichtigen Google Cloud Funktionen aktiviert werden.

Setup-Schritte:

1. Google/Firebase Account erstellen oder einloggen.
2. Neues Projekt erstellen: `HOTMESS`.
3. Google Analytics optional deaktivieren oder spaeter entscheiden.
4. Cloud Messaging aktivieren.
5. Web App hinzufuegen.
6. Web Push Zertifikat vorbereiten.
7. Keine kostenpflichtigen Google Cloud Funktionen aktivieren.
8. Keine Billing-Aktivierung, sofern nicht noetig.

Spaeter benoetigte Werte:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_WEB_PUSH_PUBLIC_KEY`

Eintrag in `.env`:

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_WEB_PUSH_PUBLIC_KEY=
```

Nicht ausfuehren:

- Keine Billing-Aktivierung ohne Entscheidung.
- Keine Service-Account-Keys im Frontend verwenden.
- Keine Push-Kampagnen live senden, bevor Consent und Datenschutztexte final sind.

## Resend

Registrierung:

- https://resend.com/signup
- https://resend.com/

Zweck fuer HOTMESS:

- Transaktionale E-Mails
- Ticketbestaetigungen
- Membership-E-Mails
- Inquiry- und CRM-Follow-ups

Empfohlene Account-E-Mail:

- `tech@hotmess-blkn.app`

Registrierungsdaten:

- Name
- E-Mail
- Unternehmen / Projekt
- Domain fuer Verifizierung

Kostenloser Plan:

- Reicht fuer technische Vorbereitung und Tests.

Zahlungsdaten:

- Fuer den kostenlosen Testbetrieb normalerweise nicht erforderlich.

Setup-Schritte:

1. Resend Account erstellen.
2. Domain `hotmess-blkn.app` hinzufuegen.
3. DNS Records notieren.
4. Domain-Verifizierung vorbereiten.
5. Absender festlegen: `no-reply@hotmess-blkn.app` oder `hello@hotmess-blkn.app`.
6. API Key erstellen und sicher speichern.
7. API Key spaeter lokal in `.env` eintragen.

Spaeter benoetigte Werte:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_REPLY_TO_EMAIL`

Eintrag in `.env`:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@hotmess-blkn.app
RESEND_REPLY_TO_EMAIL=hello@hotmess-blkn.app
```

Nicht ausfuehren:

- Kein Abo abschliessen, solange der kostenlose Plan fuer Tests reicht.
- Keine Massenmails senden, bevor Domain, SPF, DKIM, DMARC und Consent final sind.

## Postmark

Registrierung:

- https://postmarkapp.com/sign_up
- https://postmarkapp.com/

Zweck fuer HOTMESS:

- Alternative fuer transaktionale E-Mails
- Backup-Anbieter fuer wichtige Systemmails

Empfohlene Account-E-Mail:

- `tech@hotmess-blkn.app`

Registrierungsdaten:

- Name
- E-Mail
- Unternehmen / Projekt
- Sender Signature oder Domain

Kostenloser Plan:

- Fuer Vorbereitung und begrenzte Tests pruefen.

Zahlungsdaten:

- Nicht aktivieren, falls fuer Test nicht zwingend noetig.

Setup-Schritte:

1. Postmark Account erstellen.
2. Sender Signature oder Domain vorbereiten.
3. Keine bezahlten Optionen aktivieren.
4. API Token nur fuer spaetere Tests sicher notieren.

Spaeter benoetigte Werte:

- `POSTMARK_SERVER_TOKEN`
- `POSTMARK_FROM_EMAIL`

Eintrag in `.env`:

```env
POSTMARK_SERVER_TOKEN=
POSTMARK_FROM_EMAIL=no-reply@hotmess-blkn.app
```

Nicht ausfuehren:

- Postmark nicht parallel zu Resend produktiv senden lassen, bevor ein E-Mail-Routing entschieden ist.
- Keine Live-Tokens in Git eintragen.

## Supabase

Registrierung:

- https://supabase.com/dashboard/sign-up
- https://supabase.com/

Zweck fuer HOTMESS:

- Auth
- Datenbank
- Realtime
- optional Storage

Empfohlene Account-E-Mail:

- `tech@hotmess-blkn.app`

Registrierungsdaten:

- E-Mail
- Organisation / Projekt
- Datenbankpasswort
- Region

Kostenloser Plan:

- Reicht fuer Vorbereitung, Tests und Architekturvalidierung.

Zahlungsdaten:

- Fuer erste Tests normalerweise nicht erforderlich.

Setup-Schritte:

1. Supabase Account erstellen.
2. Neues Projekt erstellen: `HOTMESS`.
3. Region waehlen: Empfehlung EU-Region, wenn verfuegbar.
4. Datenbankpasswort sicher speichern.
5. Auth noch nicht produktiv aktiv migrieren.
6. Realtime vorbereiten.
7. Storage optional vorbereiten.
8. Keine bestehende HOTMESS Login-Struktur ersetzen.

Spaeter benoetigte Werte:

- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Eintrag in `.env`:

```env
SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nicht ausfuehren:

- Keine produktive Auth-Migration ohne Testplan.
- `SUPABASE_SERVICE_ROLE_KEY` niemals im Frontend verwenden.
- Keine bestehenden PHP-Accounts ersetzen, bevor Migrationsstrategie und Rollback bereitstehen.

## Clerk

Registrierung:

- https://dashboard.clerk.com/sign-up
- https://clerk.com/

Zweck fuer HOTMESS:

- Alternative Auth-Loesung
- Vergleich zu Supabase Auth

Empfohlene Account-E-Mail:

- `tech@hotmess-blkn.app`

Registrierungsdaten:

- E-Mail
- Projektname
- Login-Methoden
- App-Umgebung

Kostenloser Plan:

- Reicht fuer Evaluation.

Zahlungsdaten:

- Nicht noetig fuer reine Pruefung, sofern kostenloser Plan verfuegbar ist.

Setup-Schritte:

1. Clerk Account erstellen.
2. Test-App `HOTMESS` anlegen.
3. Login-Methoden ansehen.
4. Keine aktive Migration starten.
5. Keine bestehende Auth ersetzen.

Spaeter benoetigte Werte:

- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`

Eintrag in `.env`:

```env
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
```

Nicht ausfuehren:

- Keine HOTMESS Login-Struktur ersetzen.
- Keine produktive Domain live schalten, bevor Supabase-vs-Clerk entschieden ist.

## Auth.js

Website:

- https://authjs.dev/

Zweck fuer HOTMESS:

- Open-Source Auth-Alternative
- Relevant, falls HOTMESS spaeter staerker in Richtung Next.js migriert

Account:

- Kein klassischer Plattform-Account notwendig.

Kostenloser Plan:

- Open Source.

Zahlungsdaten:

- Keine.

Aufgabe:

- Als Open-Source-Alternative dokumentieren.
- Pruefen, ob fuer aktuelles PHP-Projekt sinnvoll.
- Wahrscheinlich nur relevant bei spaeterem Next.js-Neubau.

Spaeter benoetigte Werte:

- `AUTH_SECRET`
- `AUTH_URL`

Eintrag in `.env`:

```env
AUTH_SECRET=
AUTH_URL=
```

Nicht ausfuehren:

- Nicht in das aktuelle PHP-Login einbauen, solange kein Next.js/Auth-Migrationsentscheid getroffen ist.

## Cloudflare

Registrierung:

- https://dash.cloudflare.com/sign-up
- https://www.cloudflare.com/

Zweck fuer HOTMESS:

- Cloudflare R2 Storage
- DNS
- CDN optional
- Medienauslieferung fuer Gallery, Chat-Medien, App-Assets

Empfohlene Account-E-Mail:

- `tech@hotmess-blkn.app`

Registrierungsdaten:

- E-Mail
- Accountname / Organisation
- Domain optional
- R2 Bucket-Konfiguration

Kostenloser Plan:

- Cloudflare Account kann kostenlos vorbereitet werden. R2 hat eigene Free-Tier-/Usage-Regeln, vor Aktivierung pruefen.

Zahlungsdaten:

- Keine unnoetigen Zahlungsdaten hinterlegen. Falls R2 bei Aktivierung Zahlungsdaten verlangt, erst intern entscheiden.

Setup-Schritte:

1. Cloudflare Account erstellen.
2. Domain `hotmess-blkn.app` optional hinzufuegen.
3. R2 Bereich oeffnen.
4. Bucket vorbereiten: `hotmess-media`.
5. Keine unnoetigen kostenpflichtigen Add-ons aktivieren.
6. API Token fuer R2 vorbereiten.
7. Public Base URL oder Custom Domain fuer Medien dokumentieren.

Spaeter benoetigte Werte:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

Eintrag in `.env`:

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=hotmess-media
R2_PUBLIC_BASE_URL=
```

Nicht ausfuehren:

- Keine DNS-Nameserver umstellen, bevor Hosting-/Mail-Auswirkungen geklaert sind.
- Keine R2 Public Buckets ohne Zugriffskonzept.
- Keine kostenpflichtigen Add-ons aktivieren.

## Admin Checkliste

- [ ] Technische E-Mail `tech@hotmess-blkn.app` angelegt
- [ ] Firebase Account erstellt
- [ ] Firebase Projekt erstellt
- [ ] Firebase Cloud Messaging vorbereitet
- [ ] Resend Account erstellt
- [ ] Resend Domain vorbereitet
- [ ] Resend DNS Records notiert
- [ ] Postmark Account optional erstellt
- [ ] Supabase Account erstellt
- [ ] Supabase Projekt erstellt
- [ ] Supabase EU-Region geprueft
- [ ] Clerk Account optional erstellt
- [ ] Auth.js als Open-Source-Option bewertet
- [ ] Cloudflare Account erstellt
- [ ] R2 Bucket `hotmess-media` vorbereitet
- [ ] 2FA fuer alle Accounts aktiviert
- [ ] Recovery-E-Mail hinterlegt
- [ ] API Keys sicher gespeichert
- [ ] `.env` lokal vorbereitet
- [ ] Keine Abos abgeschlossen
- [ ] Keine Zahlungsdaten hinterlegt, ausser zwingend fuer kostenlosen Account erforderlich
- [ ] Keine Secrets committed

## Kostenlos vorbereitbar

- Firebase Spark Plan fuer Push-Vorbereitung
- Resend Free Plan fuer erste E-Mail-Tests
- Supabase Free Plan fuer Datenbank/Auth-Tests
- Clerk Free Plan fuer Auth-Evaluation
- Auth.js Open Source ohne Account
- Cloudflare Account ohne kostenpflichtige Add-ons

## Noch manuell zu erledigen

- Technische HOTMESS E-Mail-Adresse anlegen.
- Accounts manuell registrieren.
- 2FA aktivieren.
- Domains verifizieren.
- DNS Records eintragen.
- API Keys erzeugen und lokal sicher speichern.
- `.env` lokal mit echten Werten befuellen.
- Provider einzeln in Staging testen.
- Erst danach produktive Aktivierung entscheiden.
