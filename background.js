const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "explain-question") {
    handleExplainQuestion(message.payload)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error"
        })
      );

    return true;
  }

  return false;
});

async function handleExplainQuestion(payload) {
  const { geminiApiKey } = await chrome.storage.sync.get({
    geminiApiKey: ""
  });

  const apiKey = geminiApiKey.trim();
  if (!apiKey) {
    throw new Error("Add your Gemini API key in the extension settings first.");
  }

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
              "Do not claim certainty unless the evidence is strong.",
              "Do not help with cheating or hidden answer extraction.",
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
    throw new Error(`HTTP ${response.status}: ${message}`);
  }

  if (!data) {
    throw new Error(
      "Gemini returned an empty or non-JSON response. Check that your API key is valid."
    );
  }

  const outputText = extractOutputText(data);
  if (!outputText) {
    throw new Error("The model returned an empty response.");
  }

  return outputText;
}

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
  lines.push("3. If one option seems strongest, say why.");
  lines.push("4. Mention uncertainty if the question lacks context.");

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
