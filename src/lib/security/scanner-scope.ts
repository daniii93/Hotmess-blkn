export type ScannerTicketView = {
  ticketId: string;
  ticketStatus: string;
  holderName: string;
  holderPhotoUrl?: string;
  holderGender: "female" | "male" | "diverse" | "not_specified";
};

export type FullTicketRecord = ScannerTicketView & {
  email?: string;
  address?: string;
  paymentReference?: string;
  orderId?: string;
};

export const toScannerTicketView = (ticket: FullTicketRecord): ScannerTicketView => ({
  ticketId: ticket.ticketId,
  ticketStatus: ticket.ticketStatus,
  holderName: ticket.holderName,
  holderPhotoUrl: ticket.holderPhotoUrl,
  holderGender: ticket.holderGender,
});
