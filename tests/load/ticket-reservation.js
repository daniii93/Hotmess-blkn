import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    reservation_spike: {
      executor: "constant-vus",
      vus: 500,
      duration: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
  },
};

const appUrl = __ENV.APP_URL || "https://www.hotmess-blkn.app";
const eventSlug = __ENV.EVENT_SLUG;
const ticketTypeId = __ENV.TICKET_TYPE_ID;
const authTokens = (__ENV.AUTH_TOKENS || "").split(",").map((token) => token.trim()).filter(Boolean);

export default function () {
  if (!eventSlug || !ticketTypeId || authTokens.length === 0) {
    throw new Error("Set APP_URL, EVENT_SLUG, TICKET_TYPE_ID and AUTH_TOKENS for the load test.");
  }

  const token = authTokens[(__VU - 1) % authTokens.length];
  const response = http.post(
    `${appUrl}/api/events/${eventSlug}/checkout`,
    JSON.stringify({
      ticketTypeId,
      paymentProvider: "stripe",
      addons: {},
    }),
    {
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      redirects: 0,
    },
  );

  check(response, {
    "reservation handled": (res) => [200, 400, 403, 409].includes(res.status),
    "no server crash": (res) => res.status < 500,
    "reserved or waitlisted": (res) => res.status !== 200 || /checkoutUrl|waitlisted/.test(res.body),
  });

  sleep(1);
}
