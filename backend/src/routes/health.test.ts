import request from "supertest";
import app from "../app.js";

describe("Health and unauthenticated routes", () => {
  it("GET /health returns 200 and status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });

  it("GET /metrics returns workers and queueDepth", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(typeof res.body.workers).toBe("number");
    expect(typeof res.body.queueDepth).toBe("number");
  });

  it("GET /api/keys without auth returns 401", async () => {
    const res = await request(app).get("/api/keys");
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });
});
