import { emailTemplates, type EmailTemplateKey } from "./templates";

export type SendEmailInput = {
  to: string;
  template: EmailTemplateKey;
  variables?: Record<string, string>;
};

export type SendEmailResult = {
  ok: boolean;
  mode: "mock" | "resend-ready";
  message: string;
};

export const sendEmail = ({ to, template }: SendEmailInput): SendEmailResult => {
  const selected = emailTemplates.find((item) => item.key === template);
  const mode = process.env.RESEND_API_KEY ? "resend-ready" : "mock";

  return {
    ok: true,
    mode,
    message: `${selected?.subject ?? "HotMess message"} prepared for ${to}.`,
  };
};
