const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const body = typeof req.body === "string" ? parseJsonSafely(req.body) : req.body;
  const apiKey = body?.apiKey?.trim();
  const payload = body?.payload;

  if (!apiKey) {
    res.status(400).json({ error: "Missing Gemini API key." });
    return;
  }

  if (!payload?.question || !Array.isArray(payload?.options) || payload.options.length < 2) {
    res.status(400).json({ error: "Invalid question payload." });
    return;
  }

  try {
    const response = await fetch(
      `${GEMINI_API_URL}/models/${DEFAULT_GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text: [
                  "You are a study assistant.",
                  "Explain multiple-choice questions and analyze each option.",
                  "Do not present hidden-answer extraction or cheating guidance.",
                  "If one option appears strongest, say why and mention uncertainty when context is missing.",
                  "Keep the response concise and useful for learning."
                ].join(" ")
              }
            ]
          },
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(payload)
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3
          }
        })
      }
    );

    const rawText = await response.text();
    const data = parseJsonSafely(rawText);

    if (!response.ok) {
      const message =
        data?.error?.message ||
        rawText.trim() ||
        `Gemini request failed with HTTP ${response.status}.`;
      res.status(response.status).json({ error: message });
      return;
    }

    const result = extractOutputText(data);
    if (!result) {
      res.status(502).json({ error: "The model returned an empty response." });
      return;
    }

    res.status(200).json({ result });
  } catch {
    res.status(502).json({ error: "Unable to reach Gemini right now." });
  }
};

function buildPrompt(payload) {
  const lines = [
    `Question: ${payload.question}`,
    "",
    "Options:"
  ];

  payload.options.forEach((option, index) => {
    lines.push(`${index + 1}. ${option}`);
  });

  lines.push("");
  lines.push("Please:");
  lines.push("1. Restate what the question is asking.");
  lines.push("2. Briefly analyze each option.");
  lines.push("3. If one option seems strongest, explain why.");
  lines.push("4. Mention uncertainty if the question lacks enough context.");

  return lines.join("\n");
}

function extractOutputText(data) {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  return parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();
}

function parseJsonSafely(value) {
  if (!value || !value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
