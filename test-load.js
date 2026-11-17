
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '15s', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<250'],
    http_req_failed: ['rate<0.02'],
  },
};

export default function () {
  // Send GET request to games endpoint
  http.get('http://localhost:3030/games');

  // Wait for 0.5 seconds
  sleep(0.5);
}
