import { getServerEnv } from "../../config/env";

export const getPayPalServerConfig = () => {
  const env = getServerEnv();

  return {
    clientId: env.paypalClientId,
    clientSecret: env.paypalClientSecret,
    webhookId: env.paypalWebhookId,
  };
};

const getPayPalBaseUrl = () =>
  process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export const createPayPalAccessToken = async () => {
  const config = getPayPalServerConfig();
  if (!config.clientId || !config.clientSecret) throw new Error("PayPal ist nicht konfiguriert.");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) throw new Error(`PayPal Auth fehlgeschlagen: ${await response.text()}`);
  const payload = (await response.json()) as { access_token: string };
  return payload.access_token;
};

export const createPayPalOrder = async ({
  orderId,
  totalCents,
  currency,
  returnUrl,
  cancelUrl,
}: {
  orderId: string;
  totalCents: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}) => {
  const accessToken = await createPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: orderId,
          amount: {
            currency_code: currency,
            value: (totalCents / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "HotMess",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!response.ok) throw new Error(`PayPal Order fehlgeschlagen: ${await response.text()}`);
  const payload = (await response.json()) as { id: string; links?: Array<{ href: string; rel: string }> };
  const approveUrl = payload.links?.find((link) => link.rel === "approve")?.href;
  if (!approveUrl) throw new Error("PayPal Approval-Link fehlt.");
  return { paypalOrderId: payload.id, approveUrl };
};

export const capturePayPalOrder = async (paypalOrderId: string) => {
  const accessToken = await createPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`PayPal Capture fehlgeschlagen: ${await response.text()}`);
  return (await response.json()) as {
    id: string;
    purchase_units?: Array<{ payments?: { captures?: Array<{ id: string; status: string }> } }>;
  };
};

export const refundPayPalCapture = async (captureId: string, amountCents: number, currency: string) => {
  const accessToken = await createPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      amount: {
        currency_code: currency,
        value: (amountCents / 100).toFixed(2),
      },
    }),
  });

  if (!response.ok) throw new Error(`PayPal Refund fehlgeschlagen: ${await response.text()}`);
  return (await response.json()) as { id: string; status: string };
};
