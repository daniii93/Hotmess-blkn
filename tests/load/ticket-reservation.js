import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    ticket_reservation_smoke: {
      executor: "constant-vus",
      vus: Number(__ENV.VUS ?? 10),
      duration: __ENV.DURATION ?? "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1000"],
  },
};

export default function () {
  const response = http.get(`${__ENV.BASE_URL ?? "https://hotmess-blkn.com"}/events.php`);
  check(response, { "events page returns 200": (res) => res.status === 200 });
  sleep(1);
}
