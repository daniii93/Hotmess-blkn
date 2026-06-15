import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    critical_endpoints: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS ?? 20),
      duration: __ENV.DURATION ?? "1m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1200"],
  },
};

const baseUrl = __ENV.BASE_URL ?? "https://hotmess-blkn.com";

export default function () {
  for (const path of ["/events.php", "/tickets.php", "/payment-checkout.php", "/scanner.php"]) {
    const response = http.get(`${baseUrl}${path}`);
    check(response, { [`${path} returns non-5xx`]: (res) => res.status < 500 });
  }

  sleep(1);
}
