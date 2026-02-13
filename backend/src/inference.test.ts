import { createApiKey } from "./services/apiKeyService.js";
import request from "supertest";
import app from "./app.js";

describe("Chat completions", () => {
  let apiKey: string;

  beforeAll(() => {
    const created = createApiKey("test-inference");
    apiKey = created.key;
  });

  it("POST /v1/chat/completions without auth returns 401", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .send({ model: "gpt-sim", messages: [{ role: "user", content: "hi" }] });
    expect(res.status).toBe(401);
  });

  it("POST /v1/chat/completions without messages returns 400", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .set("Authorization", `Bearer ${apiKey}`)
      .send({ model: "gpt-sim", messages: [] });
    expect(res.status).toBe(400);
  });

  it("POST /v1/chat/completions returns OpenAI-style completion", async () => {
    const res = await request(app)
      .post("/v1/chat/completions")
      .set("Authorization", `Bearer ${apiKey}`)
      .send({
        model: "gpt-sim",
        messages: [{ role: "user", content: "Hello" }],
      });
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.object).toBe("chat.completion");
    expect(res.body.model).toBe("gpt-sim");
    expect(Array.isArray(res.body.choices)).toBe(true);
    expect(res.body.choices[0].message).toBeDefined();
    expect(res.body.choices[0].message.content).toBeDefined();
    expect(res.body.usage).toBeDefined();
    expect(res.body.usage.prompt_tokens).toBeGreaterThanOrEqual(0);
    expect(res.body.usage.completion_tokens).toBeGreaterThanOrEqual(0);
  }, 10000);
});
