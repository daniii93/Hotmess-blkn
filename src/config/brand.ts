import type { TargetMarket } from "../types/product";

export const brandIdentity = {
  productName: "HotMess",
  legalName: "HOTMESS BLKN",
  claimKey: "brand.claim.notForEveryone",
  positioningKey: "brand.positioning.luxuryMembersClub",
  targetAudienceKey: "brand.targetAudience.exYugoslavDiaspora",
  targetMarkets: ["DE", "AT", "CH", "IT"] as const satisfies readonly TargetMarket[],
  visualDnaKey: "brand.visualDna.luxurySocialClubBalkanEliteEuropeanTravel",
};

export const brandPrinciples = [
  "exclusive",
  "curated",
  "premium",
  "calm",
  "adult",
  "luxury",
  "social",
  "selfAssured",
] as const;

export const brandInspirations = [
  "stMoritz",
  "monaco",
  "zurich",
  "milan",
  "como",
  "lugano",
  "rooftopLounges",
  "luxuryHotels",
  "privateMembersClubs",
] as const;

export const forbiddenVisualDirections = [
  "neonNightclub",
  "cheapPartyApp",
  "datingAppPatterns",
  "tinderCards",
  "genericSaasTemplate",
  "gamingAesthetic",
  "aggressiveGradients",
  "loudPinkOrangeSurfaces",
  "overloadedScreens",
  "socialMediaClone",
  "cheapStockPhotos",
  "loudAnimations",
] as const;

export const imageDirection = {
  allowed: [
    "luxuryHotels",
    "rooftopLounges",
    "alpinePanorama",
    "elegantTerraces",
    "exclusiveRestaurants",
    "privateDinner",
    "champagneMoments",
    "premiumTravelLifestyle",
    "goldenHour",
    "warmInteriors",
    "elegantEventMoments",
  ],
  forbidden: [
    "neonClubs",
    "drunkPeople",
    "sweatyDancefloors",
    "cheapEventPhotos",
    "harshFlash",
    "edmFestival",
    "fakeStockSmile",
    "extremeInfluencerPoses",
    "aggressivePartyFlyers",
  ],
} as const;

