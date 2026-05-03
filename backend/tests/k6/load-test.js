import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = (__ENV.BASE_URL || "http://localhost:3001").replace(/\/$/, "");
const targetPath = __ENV.TARGET_PATH || "/health";
const sleepSeconds = Number(__ENV.SLEEP_SECONDS || 0.5);
const p95Ms = Number(__ENV.P95_MS || 500);

export const options = {
  vus: Number(__ENV.VUS || 10),
  duration: __ENV.DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [`p(95)<${p95Ms}`]
  }
};

export default function () {
  const response = http.get(`${baseUrl}${targetPath}`, {
    redirects: 0
  });

  check(response, {
    "status is acceptable": (res) => res.status >= 200 && res.status < 400
  });

  sleep(sleepSeconds);
}
