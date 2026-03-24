const form = document.getElementById("analyzer-form");
const formUrlInput = document.getElementById("form-url");
const apiKeyInput = document.getElementById("api-key");
const statusElement = document.getElementById("status");
const questionsPanel = document.getElementById("questions-panel");
const questionsContainer = document.getElementById("questions");
const questionTemplate = document.getElementById("question-template");
const analyzeAllButton = document.getElementById("analyze-all");

let currentQuestions = [];

form.addEventListener("submit", handleLoadQuestions);
analyzeAllButton.addEventListener("click", handleAnalyzeAll);

async function handleLoadQuestions(event) {
  event.preventDefault();

  const formUrl = formUrlInput.value.trim();
  const apiKey = apiKeyInput.value.trim();

  if (!formUrl || !apiKey) {
    setStatus("Add both the Google Form URL and your Gemini API key.", "error");
    return;
  }

  setStatus("Loading and parsing the Google Form...", "loading");
  questionsPanel.classList.add("panel--hidden");
  questionsContainer.replaceChildren();
  currentQuestions = [];

  try {
    const response = await fetch(`/api/fetch-form?url=${encodeURIComponent(formUrl)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Unable to load that Google Form.");
    }

    const questions = extractQuestionsFromHtml(data.html);
    if (!questions.length) {
      throw new Error(
        "No multiple-choice questions were detected. Make sure the form is public and uses radio-button questions."
      );
    }

    currentQuestions = questions;
    renderQuestions(questions);
    questionsPanel.classList.remove("panel--hidden");
    setStatus(`Loaded ${questions.length} multiple-choice question(s).`, "success");
  } catch (error) {
    setStatus(
      error instanceof Error ? error.message : "Unable to load that Google Form.",
      "error"
    );
  }
}

async function handleAnalyzeAll() {
  const buttons = Array.from(
    questionsContainer.querySelectorAll(".question-card__button")
  ).filter((button) => !button.disabled);

  for (const button of buttons) {
    await analyzeQuestionCard(button.closest(".question-card"));
  }
}

function extractQuestionsFromHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const groups = doc.querySelectorAll('[role="radiogroup"]');
  const questions = [];

  for (const group of groups) {
    const details = extractQuestionDetails(group);
    if (details && details.options.length >= 2) {
      questions.push(details);
    }
  }

  return dedupeQuestions(questions);
}

function extractQuestionDetails(group) {
  const questionContainer =
    group.closest('[role="listitem"]') ||
    group.closest(".Qr7Oae") ||
    group.parentElement;

  if (!questionContainer) {
    return null;
  }

  const heading =
    questionContainer.querySelector('[role="heading"]') ||
    questionContainer.querySelector(".M7eMe") ||
    questionContainer.querySelector(".HoXoMd");

  const question = normalizeText(heading?.textContent);
  if (!question) {
    return null;
  }

  const radios = Array.from(group.querySelectorAll('[role="radio"]'));
  const options = radios
    .map((radio) => {
      const ariaLabel = normalizeText(radio.getAttribute("aria-label"));
      if (ariaLabel) {
        return ariaLabel;
      }

      return normalizeText(radio.textContent);
    })
    .filter(Boolean);

  return options.length ? { question, options } : null;
}

function dedupeQuestions(questions) {
  const seen = new Set();

  return questions.filter((question) => {
    const key = `${question.question}::${question.options.join("|")}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function renderQuestions(questions) {
  const cards = questions.map((question, index) => {
    const fragment = questionTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".question-card");
    const title = fragment.querySelector(".question-card__title");
    const options = fragment.querySelector(".question-card__options");
    const button = fragment.querySelector(".question-card__button");

    card.dataset.index = String(index);
    title.textContent = question.question;
    options.replaceChildren(
      ...question.options.map((option) => {
        const item = document.createElement("li");
        item.textContent = option;
        return item;
      })
    );

    button.addEventListener("click", () => analyzeQuestionCard(card));
    return fragment;
  });

  questionsContainer.replaceChildren(...cards);
}

async function analyzeQuestionCard(card) {
  const index = Number(card.dataset.index);
  const question = currentQuestions[index];
  const button = card.querySelector(".question-card__button");
  const status = card.querySelector(".question-card__status");
  const output = card.querySelector(".question-card__output");
  const apiKey = apiKeyInput.value.trim();

  if (!question || !apiKey) {
    setCardStatus(card, "Add your Gemini API key first.", "error");
    return;
  }

  button.disabled = true;
  status.hidden = false;
  output.hidden = true;
  setCardStatus(card, "Generating study analysis...", "loading");

  try {
    const response = await fetch("/api/analyze-form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apiKey,
        payload: question
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Analysis failed.");
    }

    output.textContent = data.result;
    output.hidden = false;
    setCardStatus(card, "Analysis ready.", "success");
  } catch (error) {
    setCardStatus(
      card,
      error instanceof Error ? error.message : "Analysis failed.",
      "error"
    );
  } finally {
    button.disabled = false;
  }
}

function setStatus(message, state) {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

function setCardStatus(card, message, state) {
  const element = card.querySelector(".question-card__status");
  element.hidden = false;
  element.textContent = message;
  element.dataset.state = state;
}

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}
