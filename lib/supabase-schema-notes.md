# HotMess Supabase Schema Notes

These notes map the centralized TypeScript data layer to future Supabase tables.

## Core Tables

- `events`: event metadata, ticket status, hero media, venue, schedule, safety notes, FAQ, status.
- `ticket_types`: event ticket tiers, price, benefits, membership requirement, provider URL.
- `hotels`: hotel partner profiles, city, booking URL, shuttle/fast-lane flags, membership benefits.
- `packages`: HotMess Weekend package records, type, pricing, availability, included/excluded items, relations.
- `package_itinerary_items`: day-by-day package itinerary rows.
- `community_events`: HotMess Circle events, member-only settings, capacity, registration URL, partners and ambassadors.
- `membership_tiers`: Free, Plus and Black Passport configuration.
- `partners`: partner and sponsor master records.
- `partner_offers`: codes, benefits, validity, tier requirement and city.
- `gallery_items`: gallery campaigns, photos, videos and aftermovies.
- `gallery_media`: normalized images/videos attached to a gallery item.
- `users`: auth-linked user record.
- `user_profiles`: user display profile, interests, preferred cities and newsletter consent.
- `app_offers`: app-specific partner offer cards.
- `inquiries`: package, hotel, partner, VIP/table and general requests.

## Relation Tables

- `event_hotels`
- `event_packages`
- `event_partners`
- `event_sponsors`
- `package_events`
- `package_hotels`
- `package_partner_offers`
- `package_sponsors`
- `partner_placements`
- `membership_benefits`
- `user_saved_events`
- `user_saved_hotels`
- `user_saved_packages`
- `user_tickets`
- `user_benefits`
- `user_notification_preferences`

## Implementation Notes

- Use UUID primary keys in Supabase and keep current string IDs as `legacy_key` or `slug` where useful.
- Keep `slug` unique per public entity table: events, hotels, packages, partners, gallery.
- Use enum constraints for status values shown in `types/index.ts`.
- Store repeated simple fields as relation tables when they need analytics or management; JSON is acceptable for early-stage static lists such as `galleryImages`.
- Connect Supabase Auth users to `user_profiles.user_id`.
