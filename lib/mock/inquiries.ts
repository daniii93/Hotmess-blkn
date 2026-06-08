import type { Inquiry } from "../../types";

export const inquiries: Inquiry[] = [
  {
    id: "inq-package-1",
    type: "package",
    relatedId: "pkg-innsbruck-vip-weekend",
    subject: "VIP Weekend Anfrage",
    name: "Sophia K.",
    email: "sophia@example.com",
    phone: "+4300000000",
    city: "Innsbruck",
    message: "Interested in two VIP spots and hotel recommendation.",
    relatedPackageId: "pkg-innsbruck-vip-weekend",
    status: "new",
    createdAt: "2026-06-02T11:20:00+02:00",
    updatedAt: "2026-06-02T11:20:00+02:00",
  },
  {
    id: "inq-partner-1",
    type: "partner",
    subject: "Wellness Partner Bewerbung",
    name: "Wellness Lead",
    email: "wellness@example.com",
    city: "Vienna",
    message: "Interested in membership and package placements.",
    status: "in_progress",
    createdAt: "2026-06-01T18:40:00+02:00",
    updatedAt: "2026-06-02T09:00:00+02:00",
  },
];
