import Link from "next/link";
import type {
  ChatMessage,
  ChatThreadMeta,
  ConversationSummary,
  FeedAuthor,
  FriendActivityItem,
  NotificationItem,
  SocialPost,
  SocialStory,
} from "@/features/social/live-service";
import { ChatMessageActions, CreatePostForm, LikeButton, MessageComposer } from "@/components/social/social-actions";
import { GroupInfoPanel } from "@/components/inbox/GroupInfoPanel";

const card = "rounded-card border border-hm-border bg-hm-porcelain shadow-luxury";
const soft = "rounded-card border border-hm-borderSoft bg-hm-ivory";

const initials = (name: string) => name.trim().slice(0, 1).toUpperCase() || "H";

function Avatar({ author }: { author: FeedAuthor }) {
  return (
    <span className="grid size-11 place-items-center overflow-hidden rounded-full border border-hm-gold bg-hm-champagne text-sm font-semibold text-hm-ink">
      {author.avatarUrl ? <img alt={author.name} className="h-full w-full object-cover" src={author.avatarUrl} /> : initials(author.name)}
    </span>
  );
}

export function StoryBar({ stories }: { stories: SocialStory[] }) {
  return (
    <section className={`${card} overflow-x-auto p-4`}>
      <div className="flex gap-4">
        <Link className="flex min-w-20 flex-col items-center gap-2 text-xs text-hm-inkSoft" href="/create">
          <span className="grid size-14 place-items-center rounded-full border border-hm-gold bg-hm-champagne font-semibold text-hm-ink">+</span>
          <span>Deine Story</span>
        </Link>
        {stories.map((story) => (
          <Link className="flex min-w-20 flex-col items-center gap-2 text-xs text-hm-inkSoft" href={`/feed/stories/${story.id}`} key={story.id}>
            <span className="grid size-14 place-items-center overflow-hidden rounded-full border border-hm-gold bg-hm-champagne font-semibold text-hm-ink">
              {story.mediaUrl ? <img alt={story.author.name} className="h-full w-full object-cover" src={story.mediaUrl} /> : initials(story.author.name)}
            </span>
            <span>{story.author.name.split(" ")[0]}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PostCard({ post }: { post: SocialPost }) {
  return (
    <article className={card}>
      <header className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <Avatar author={post.author} />
          <div>
            <p className="font-semibold text-hm-ink">{post.author.name}</p>
            <p className="text-xs text-hm-inkSoft">@{post.author.username} · {post.locationLabel ?? post.author.city ?? "HotMess"}</p>
          </div>
        </div>
        <button className="rounded-full px-3 py-2 text-hm-inkSoft" type="button">...</button>
      </header>
      {post.mediaUrls[0] ? (
        <div className="aspect-[4/5] overflow-hidden bg-hm-champagne">
          <img alt={post.content ?? "HotMess Beitrag"} className="h-full w-full object-cover" src={post.mediaUrls[0]} />
        </div>
      ) : (
        <div className="grid min-h-56 place-items-center bg-hm-champagne p-8 text-center">
          <p className="hm-display text-3xl text-hm-ink">{post.content}</p>
        </div>
      )}
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-3 text-sm font-semibold text-hm-ink">
          <LikeButton initialCount={post.likesCount} initialLiked={post.likedByMe} postId={post.id} />
          <Link href={`/feed?post=${post.id}`}>Kommentieren · {post.commentsCount}</Link>
          <button type="button">Teilen</button>
          <button className="ml-auto" type="button">Speichern</button>
        </div>
        {post.content ? <p className="text-sm leading-7 text-hm-ink">{post.content}</p> : null}
        {post.hashtags.length > 0 ? <p className="text-sm text-hm-goldDeep">{post.hashtags.map((tag) => `#${tag}`).join(" ")}</p> : null}
      </div>
    </article>
  );
}

export function EventCardInline({ activities }: { activities: FriendActivityItem[] }) {
  const item = activities.find((activity) => activity.activityType === "ticket_purchase" || activity.activityType === "going_to_event");
  if (!item) return null;

  return (
    <article className={`${card} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Event-Aktivitaet</p>
      <h2 className="hm-display mt-3 text-3xl text-hm-ink">{item.actor.name} geht zu {item.referenceLabel ?? "einem HotMess Event"}</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white" href={item.eventId ? `/events/${item.eventId}/checkout` : "/events"}>
          Ich auch
        </Link>
        <Link className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink" href="/events">
          Event ansehen
        </Link>
      </div>
    </article>
  );
}

export function FeedList({ posts, activities }: { posts: SocialPost[]; activities: FriendActivityItem[] }) {
  if (posts.length === 0) {
    return <section className={`${card} mx-auto max-w-2xl p-5 text-sm text-hm-inkSoft`}>Noch keine Beitraege. Erstelle den ersten HotMess Moment.</section>;
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      {posts.map((post, index) => (
        <div key={post.id} className="space-y-6">
          <PostCard post={post} />
          {index === 0 ? <EventCardInline activities={activities} /> : null}
        </div>
      ))}
    </section>
  );
}

export function StoryViewer() {
  return (
    <main className="min-h-screen bg-hm-ink px-4 py-6 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-between rounded-card border border-hm-gold/40 bg-[#2a241d] p-5 shadow-luxury">
        <div className="h-1 rounded-full bg-hm-gold" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-luxury text-hm-gold">Story</p>
          <h1 className="hm-display mt-3 text-4xl">HotMess Story</h1>
          <p className="mt-3 text-sm text-hm-champagne">Antworten, Reaktionen und Umfragen sind vorbereitet.</p>
        </div>
        <div className="flex items-center gap-2 rounded-pill border border-hm-gold/40 bg-black/20 p-2">
          {["Antworten", "Like", "Umfrage"].map((item) => (
            <button className="rounded-pill px-4 py-2 text-sm text-hm-champagne hover:bg-white/10" key={item} type="button">{item}</button>
          ))}
        </div>
      </section>
    </main>
  );
}

export function CreatePost() {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Neuer Beitrag</p>
      <h1 className="hm-display mt-3 text-4xl text-hm-ink">Teile einen Moment</h1>
      <div className="mt-6">
        <CreatePostForm />
      </div>
    </section>
  );
}

export function CreateStory() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Story erstellen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Foto, Video, Event-Story, Badge, Geburtstag, Umfrage oder Frage.</p>
    </section>
  );
}

export function FriendActivityFeed({ activities }: { activities: FriendActivityItem[] }) {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Was ist los?</p>
      <div className="mt-6 space-y-3">
        {activities.length === 0 ? <p className="text-sm text-hm-inkSoft">Noch keine Freunde-Aktivitaet.</p> : null}
        {activities.map((activity) => (
          <ActivityItem activity={activity} key={activity.id} />
        ))}
      </div>
    </section>
  );
}

export function ActivityItem({ activity }: { activity: FriendActivityItem }) {
  return (
    <div className={`${soft} flex flex-wrap items-center justify-between gap-4 p-4`}>
      <div>
        <p className="text-xs uppercase tracking-luxury text-hm-inkSoft">{new Date(activity.createdAt).toLocaleString("de-AT")}</p>
        <p className="mt-1 font-semibold text-hm-ink">{activity.actor.name} · {activity.activityType} {activity.referenceLabel ?? ""}</p>
      </div>
      <Link className="rounded-pill bg-hm-ink px-5 py-3 text-sm font-semibold text-white" href="/events">
        Ich auch
      </Link>
    </div>
  );
}

export function ConversationList({ conversations }: { conversations: ConversationSummary[] }) {
  return (
    <section className={`${card} p-4`}>
      <div className="flex gap-2">
        <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm font-semibold text-white" type="button">Chats</button>
        <button className="rounded-pill border border-hm-gold px-4 py-2 text-sm font-semibold text-hm-ink" type="button">Anfragen</button>
      </div>
      <div className="mt-4 space-y-3">
        {conversations.length === 0 ? <p className="p-3 text-sm text-hm-inkSoft">Noch keine Chats.</p> : null}
        {conversations.map((conversation) => (
          <Link className={`${soft} flex items-center gap-3 p-4`} href={`/chat/${conversation.id}`} key={conversation.id}>
            <span className="grid size-11 place-items-center rounded-full border border-hm-gold bg-hm-champagne text-sm font-semibold">{initials(conversation.name)}</span>
            <span>
              <span className="block font-semibold text-hm-ink">{conversation.name}</span>
              <span className="text-sm text-hm-inkSoft">{conversation.preview ?? "Noch keine Nachricht"} {conversation.unreadCount > 0 ? `· ${conversation.unreadCount} neu` : ""}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function RequestsFolder() {
  return (
    <section className={`${card} p-5`}>
      <p className="font-semibold text-hm-ink">Anfragen</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Nicht-Freunde landen hier mit Annehmen, Ablehnen und Melden.</p>
    </section>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const reactionSummary = message.reactions.map((reaction) => reaction.emoji).join(" ");

  if (message.type === "system") {
    return (
      <div className="mx-auto max-w-[88%] rounded-full bg-hm-champagne/70 px-4 py-2 text-center text-xs font-semibold text-hm-inkSoft">
        {message.content ?? "Systemmeldung"}
      </div>
    );
  }

  return (
    <div className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm ${message.mine ? "ml-auto bg-hm-ink text-white" : "bg-hm-champagne text-hm-ink"}`}>
      {message.replyToId ? <p className={`mb-2 rounded-2xl px-3 py-2 text-xs ${message.mine ? "bg-white/10 text-white/70" : "bg-white/70 text-hm-inkSoft"}`}>Antwort auf eine Nachricht</p> : null}
      {message.isPinned ? <p className={`mb-1 text-[11px] font-bold uppercase tracking-[0.16em] ${message.mine ? "text-hm-gold" : "text-hm-goldDeep"}`}>Angepinnt</p> : null}
      {message.isDeletedForAll ? <em className={message.mine ? "text-white/70" : "text-hm-inkSoft"}>Nachricht wurde zurueckgerufen.</em> : (
        <>
          {message.type === "voice" ? (
            <div>
              <p className="font-bold">Sprachnachricht</p>
              <div className={`mt-2 h-8 rounded-full ${message.mine ? "bg-white/15" : "bg-hm-gold/20"}`} />
              {message.transcript ? <p className={`mt-2 text-xs ${message.mine ? "text-white/75" : "text-hm-inkSoft"}`}>Transkript: {message.transcript}</p> : <p className={`mt-2 text-xs ${message.mine ? "text-white/65" : "text-hm-inkSoft"}`}>Transkript wird vorbereitet.</p>}
            </div>
          ) : message.type === "event_card" ? (
            <div className={`rounded-2xl border p-3 ${message.mine ? "border-white/20 bg-white/10" : "border-hm-gold/25 bg-hm-porcelain"}`}>
              <p className="font-bold">HotMess Event</p>
              <p className="mt-1">{message.content}</p>
              <Link className={`mt-3 inline-flex rounded-pill px-3 py-1 text-xs font-bold ${message.mine ? "bg-white text-hm-ink" : "bg-hm-ink text-white"}`} href="/events">Ticket ansehen</Link>
            </div>
          ) : (
            <p>{message.content}</p>
          )}
          {message.edited ? <p className={`mt-1 text-[11px] ${message.mine ? "text-white/65" : "text-hm-inkSoft"}`}>Bearbeitet</p> : null}
        </>
      )}
      {reactionSummary ? <p className={`mt-2 text-sm ${message.mine ? "text-white" : "text-hm-ink"}`}>{reactionSummary}</p> : null}
      {!message.isDeletedForAll ? <ChatMessageActions messageId={message.id} mine={message.mine} content={message.content} /> : null}
    </div>
  );
}

export function ChatThread({ conversationId, messages, meta }: { conversationId: string; messages: ChatMessage[]; meta?: ChatThreadMeta | null }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-8">
      <section className={`${card} flex min-h-[75vh] flex-col p-4`}>
        <header className="border-b border-hm-border pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center overflow-hidden rounded-full border border-hm-gold bg-hm-champagne text-sm font-bold text-hm-ink">
              {meta?.avatarUrl ? <img alt={meta.name} className="h-full w-full object-cover" src={meta.avatarUrl} /> : initials(meta?.name ?? "H")}
            </span>
            <div>
              <p className="font-semibold text-hm-ink">{meta?.name ?? "HotMess Chat"}</p>
              <p className="text-sm text-hm-inkSoft">
                {meta?.isGroupLike ? `${meta.memberCount} Mitglieder · Gruppenchat` : "Reagieren, Antworten, Bearbeiten (15 Min.), Zurueckrufen, Pinnen und Melden."}
              </p>
            </div>
          </div>
          {meta?.isGroupLike ? <GroupInfoPanel meta={meta} /> : null}
        </header>
        <div className="flex-1 space-y-3 py-5">
          {messages.length === 0 ? <p className="text-sm text-hm-inkSoft">Noch keine Nachrichten.</p> : null}
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
        </div>
        <MessageComposer conversationId={conversationId} />
      </section>
    </main>
  );
}

export function NotificationTabs() {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {["Alle", "Personen denen du folgst", "Anfragen", "Likes", "Kommentare", "Erwaehnungen"].map((tab) => (
        <button className="rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" key={tab} type="button">{tab}</button>
      ))}
    </div>
  );
}

export function NotificationCenter({ notifications }: { notifications: NotificationItem[] }) {
  return (
    <section className={`${card} p-5 sm:p-8`}>
      <NotificationTabs />
      <div className="mt-5 space-y-3">
        {notifications.length === 0 ? <p className="text-sm text-hm-inkSoft">Keine Benachrichtigungen.</p> : null}
        {notifications.map((notification) => (
          <div className={`${soft} p-4`} key={notification.id}>
            <p className="font-semibold text-hm-ink">{notification.title}</p>
            <p className="mt-1 text-sm text-hm-inkSoft">{notification.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SearchBar() {
  return <input className="w-full rounded-pill border border-hm-border bg-hm-porcelain px-5 py-4 outline-none focus:border-hm-gold" placeholder="Suche nach Personen, Events, Hashtags oder Orten" />;
}

export function PeopleYouMayKnow({ people }: { people: FeedAuthor[] }) {
  return (
    <section className={`${card} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Personen die du kennen koenntest</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <div className={`${soft} flex items-center justify-between gap-3 p-4`} key={person.id}>
            <span className="font-semibold text-hm-ink">{person.name}</span>
            <button className="rounded-pill bg-hm-ink px-4 py-2 text-sm text-white" type="button">Folgen</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrendingTags({ hashtags }: { hashtags: Array<{ hashtag: string; post_count: number }> }) {
  return (
    <section className={`${card} p-5`}>
      <p className="text-xs font-semibold uppercase tracking-luxury text-hm-goldDeep">Trending Hashtags</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(hashtags.length ? hashtags : [{ hashtag: "hotmess", post_count: 0 }]).map((tag) => (
          <span className="rounded-pill border border-hm-gold px-4 py-2 text-sm text-hm-ink" key={tag.hashtag}>#{tag.hashtag}</span>
        ))}
      </div>
    </section>
  );
}

export function DiscoverGrid({ people, hashtags }: { people: FeedAuthor[]; hashtags: Array<{ hashtag: string; post_count: number }> }) {
  return (
    <section className="grid gap-5 md:grid-cols-2">
      <PeopleYouMayKnow people={people} />
      <TrendingTags hashtags={hashtags} />
    </section>
  );
}

export function NotificationBell() {
  return <Link className="rounded-full border border-hm-gold px-3 py-2 text-sm text-hm-ink" href="/notifications">3</Link>;
}

export function PokeButton() {
  return <button className="rounded-pill border border-hm-gold px-5 py-3 text-sm font-semibold text-hm-ink" type="button">Anstupsen</button>;
}

export function ReportDialog() {
  return (
    <div className={`${soft} p-4`}>
      <p className="font-semibold text-hm-ink">Melden</p>
      <p className="mt-2 text-sm text-hm-inkSoft">Spam, Belaestigung, Fake-Profil oder unangemessener Inhalt.</p>
    </div>
  );
}
