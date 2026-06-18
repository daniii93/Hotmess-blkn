export type CommunityKind = "business" | "event" | "service" | "creator" | "digital" | "member";

export type CommunityItem = {
  id: string;
  kind: CommunityKind;
  title: string;
  text: string;
  href: string;
  memberCount: number | null;
  private: boolean;
  source: string;
};
