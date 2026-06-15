# HotMess Feature Flags

Feature flags live in `src/config/features.ts`.

## States

- `active`
- `hidden`
- `disabled`
- `beta`
- `future`

## Rule

Features are never deleted because they are not currently visible. They are marked as `hidden`, `disabled` or `future`.

## Purpose

Feature flags allow HotMess to preserve long-term product intent while shipping the platform in safe phases.

Examples:

- Dating is `disabled`.
- Stories are `future`.
- Core ticketing is `active`.
- Some rollout features may be `beta`.

