import { promptTemplates } from "./prompts";
import { recommendBenefits, recommendCities, recommendCommunityEvents, recommendEvents, recommendHotels, recommendPackages } from "./recommendations";

export type ConciergeProvider = "mock" | "openai" | "azure_openai" | "claude" | "future_model";

export type ConciergeProfile = {
  userId: string;
  preferredCities: string[];
  membershipTier: string;
  loyaltyLevel: string;
};

export type ConciergeRequest = {
  id: string;
  userId: string;
  category: "travel" | "hotel" | "package" | "vip" | "event" | "membership" | "general";
  message: string;
  status: "new" | "in_progress" | "resolved" | "archived";
  assignedTo?: string;
  createdAt: string;
};

export const getConciergeProvider = (): ConciergeProvider => {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.AZURE_OPENAI_ENDPOINT) return "azure_openai";
  if (process.env.CLAUDE_API_KEY) return "claude";
  return "mock";
};

export const buildConciergeContext = (profile: ConciergeProfile) => ({
  provider: getConciergeProvider(),
  profile,
  prompts: promptTemplates.filter((prompt) => prompt.active),
  recommendations: {
    events: recommendEvents(),
    hotels: recommendHotels(),
    packages: recommendPackages(),
    benefits: recommendBenefits(),
    community: recommendCommunityEvents(),
    cities: recommendCities(),
  },
});
