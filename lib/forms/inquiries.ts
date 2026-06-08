import type { Inquiry, InquiryStatus, InquiryType } from "../../types";

export type InquiryFormResult = {
  ok: boolean;
  mode: "mock" | "supabase";
  message: string;
  errors: string[];
};

export type InquiryFormInput = {
  type: InquiryType;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  subject?: string;
  message?: string;
  relatedEventId?: string;
  relatedHotelId?: string;
  relatedPackageId?: string;
  relatedPartnerId?: string;
  metadata?: Inquiry["metadata"];
};

export const inquiryTypes: InquiryType[] = ["package", "hotel", "vip_table", "partner", "ambassador", "general"];
export const inquiryStatuses: InquiryStatus[] = ["new", "contacted", "in_progress", "converted", "lost", "archived"];

export const validateInquiryInput = (input: InquiryFormInput): string[] => {
  const errors: string[] = [];

  if (!inquiryTypes.includes(input.type)) {
    errors.push("Invalid inquiry type.");
  }

  if (!input.name?.trim()) {
    errors.push("Name is required.");
  }

  if (!input.email?.trim() || !input.email.includes("@")) {
    errors.push("A valid email is required.");
  }

  if (!input.message?.trim()) {
    errors.push("Message is required.");
  }

  return errors;
};

export const createMockInquiry = (input: InquiryFormInput): Inquiry => ({
  id: `mock-${input.type}-${Date.now()}`,
  type: input.type,
  status: "new",
  subject: input.subject ?? input.type,
  name: input.name ?? "",
  email: input.email ?? "",
  phone: input.phone,
  city: input.city,
  message: input.message,
  relatedEventId: input.relatedEventId,
  relatedHotelId: input.relatedHotelId,
  relatedPackageId: input.relatedPackageId,
  relatedPartnerId: input.relatedPartnerId,
  metadata: input.metadata,
  internalNotes: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const submitInquiryMock = (input: InquiryFormInput): InquiryFormResult => {
  const errors = validateInquiryInput(input);

  if (errors.length > 0) {
    return { ok: false, mode: "mock", message: "Inquiry validation failed.", errors };
  }

  return {
    ok: true,
    mode: "mock",
    message: "Inquiry captured in mock mode. Supabase persistence can be connected later.",
    errors: [],
  };
};
