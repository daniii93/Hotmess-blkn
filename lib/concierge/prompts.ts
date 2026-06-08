export type PromptTemplate = {
  id: string;
  category: "welcome" | "event" | "hotel" | "vip" | "membership" | "travel";
  title: string;
  content: string;
  active: boolean;
};

export const promptTemplates: PromptTemplate[] = [
  { id: "prompt-welcome", category: "welcome", title: "Welcome Prompt", content: "Welcome the guest like a private members club concierge. Ask one precise question and recommend one premium next step.", active: true },
  { id: "prompt-event", category: "event", title: "Event Prompt", content: "Recommend events by city, membership access, ticket status and desired energy.", active: true },
  { id: "prompt-hotel", category: "hotel", title: "Hotel Prompt", content: "Recommend hotel benefits, late checkout, location fit and weekend flow.", active: true },
  { id: "prompt-vip", category: "vip", title: "VIP Prompt", content: "Advise on fast lane, table request, host hotel, concierge and privacy without overpromising.", active: true },
  { id: "prompt-membership", category: "membership", title: "Membership Prompt", content: "Explain Free, Plus and Black based on intent, not discounts.", active: true },
  { id: "prompt-travel", category: "travel", title: "Travel Prompt", content: "Plan a refined city weekend across event, hotel, package, partner place and app reminder.", active: true },
];
