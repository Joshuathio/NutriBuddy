const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GPT_MODEL = process.env.GPT_MODEL || "gpt-5";

let history = [];

const SYSTEM_PROMPT = `
You are a pediatric nutrition assistant for Indonesian families.

Rules:
- Calm and reassuring
- Do NOT over-alarm
- Use Posyandu and Puskesmas references
- Only warn about emergencies when clearly needed
- reply in the same language as the user
`;

function buildPrompt(messages) {
  return messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
}

function extractText(resp) {
  if (resp.data.output_text) return resp.data.output_text;

  const out = resp.data.output;
  if (!out) return "";

  for (const item of out) {
    if (item.content) {
      for (const c of item.content) {
        if (c.text) return c.text;
      }
    }
  }
  return "";
}

async function callGPT(messages, maxTokens = 800) {
  const response = await axios.post(
    "https://api.openai.com/v1/responses",
    {
      model: GPT_MODEL,
      input: buildPrompt(messages),
      max_output_tokens: maxTokens
    },
    {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 30000
    }
  );

  return extractText(response);
}

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    model: GPT_MODEL,
    apiKey: Boolean(OPENAI_API_KEY),
    time: new Date().toISOString()
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    console.log("User:", message);

    let messages = [{ role: "system", content: SYSTEM_PROMPT }];

    if (history.length > 0) messages = messages.concat(history.slice(-10));

    messages.push({ role: "user", content: message });

    const reply = await callGPT(messages);

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });

    if (history.length > 20) history = history.slice(-20);

    res.json({ success: true, message: reply, model: GPT_MODEL });

  } catch (err) {
    console.error("GPT ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "GPT failed", details: err.response?.data || err.message });
  }
});

app.post("/assess", async (req, res) => {
  try {
    const { weight, height, age, muac, gender = "unknown" } = req.body;

    const prompt = `
Child nutrition assessment:

Age: ${age} months
Gender: ${gender}
Weight: ${weight} kg
Height: ${height} cm
MUAC: ${muac || "not measured"}

Give:
1. Nutrition status
2. Risk level
3. Advice for Indonesian parents
4. When to go to Posyandu or Puskesmas
`;

    const reply = await callGPT([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt }
    ], 1000);

    res.json({ success: true, assessment: reply });

  } catch (err) {
    res.status(500).json({ error: "Assessment failed", details: err.message });
  }
});

app.post("/reset", (req, res) => {
  history = [];
  res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`
====================================
 BACKEND RUNNING
====================================
 Local: http://localhost:${PORT}
 Model: ${GPT_MODEL}
 API Key: ${OPENAI_API_KEY ? "OK" : "MISSING"}
====================================
`);
});
