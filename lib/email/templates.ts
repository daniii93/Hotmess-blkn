export type EmailTemplateKey = "welcome" | "membership" | "event_booking" | "package_inquiry" | "hotel_inquiry" | "partner_application" | "ambassador_application" | "concierge_request";

export type EmailTemplate = {
  key: EmailTemplateKey;
  subject: string;
  body: string;
};

export const emailTemplates: EmailTemplate[] = [
  { key: "welcome", subject: "Welcome to HotMess Passport", body: "Your HotMess account is ready. Your weekend starts before the door opens." },
  { key: "membership", subject: "Your Passport benefits", body: "Your membership layer is active. Review your benefits in the HotMess Guide." },
  { key: "event_booking", subject: "Your HotMess event booking", body: "Your ticket signal is prepared. Save the event in the HotMess Guide." },
  { key: "package_inquiry", subject: "Your HotMess Weekend inquiry", body: "The concierge desk received your package request." },
  { key: "hotel_inquiry", subject: "Your HotMess hotel inquiry", body: "The travel desk received your hotel request." },
  { key: "partner_application", subject: "Partner application received", body: "Your partnership request is ready for review." },
  { key: "ambassador_application", subject: "Ambassador application received", body: "Your ambassador request is ready for review." },
  { key: "concierge_request", subject: "Concierge request received", body: "Your private concierge request has been captured." },
];
