# Chat Screenshot Notifications

HotMess reports screenshots only inside an active private chat context. No screenshot image data is stored or transferred.

## Backend Endpoint

`POST /api/chat/screenshot-events`

JSON payload:

```json
{
  "conversation_id": 12,
  "content_id": "chat:12",
  "captured_at": "2026-06-04T16:30:00.000Z",
  "client_event_id": "ios-uuid-or-android-uuid"
}
```

Server behavior:

- validates the authenticated user session
- validates that the user is a participant of the chat
- deduplicates by `client_event_id` and by chat/user/content/timestamp
- stores metadata in `chat_screenshot_events`
- creates a `system` chat message: `{name} hat einen Screenshot gemacht.`
- stores a pending `chat_realtime_events` payload for a future WebSocket worker
- returns the same `websocket_event` payload to the caller

## iOS Hook

Use `UIApplication.userDidTakeScreenshotNotification` only while a HotMess chat screen is visible.

```swift
NotificationCenter.default.addObserver(
    forName: UIApplication.userDidTakeScreenshotNotification,
    object: nil,
    queue: .main
) { [weak self] _ in
    guard let chat = self?.visibleChatContext else { return }

    HotMessApi.postScreenshotEvent(
        conversationId: chat.conversationId,
        contentId: "chat:\(chat.conversationId)",
        capturedAt: ISO8601DateFormatter().string(from: Date()),
        clientEventId: UUID().uuidString
    )
}
```

## Android Hook

On Android 14+, use the platform screenshot detection API only while a HotMess chat screen is visible.

For older Android versions, a `ContentObserver` fallback can be used if it respects privacy rules and only reports while the active chat route is visible.

Payload must match the backend contract above. Do not upload screenshot files, thumbnails, paths, or media-store image data.

## Web/PWA Bridge

Browsers do not expose reliable screenshot detection. Native shells can call:

```js
window.HotMessChat.reportScreenshotEvent({
  conversation_id: 12,
  content_id: "chat:12",
  captured_at: new Date().toISOString(),
  client_event_id: crypto.randomUUID()
});
```

The web bridge skips reporting if no active chat context exists or the page is hidden.
