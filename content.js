const QUESTION_SELECTOR = '[role="radiogroup"]';
const ENHANCED_ATTRIBUTE = "data-study-helper-enhanced";
const PANEL_ATTRIBUTE = "data-study-helper-panel";

init();

function init() {
  enhanceQuestions();

  const observer = new MutationObserver(() => {
    enhanceQuestions();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function enhanceQuestions() {
  const groups = document.querySelectorAll(QUESTION_SELECTOR);

  for (const group of groups) {
    if (group.hasAttribute(ENHANCED_ATTRIBUTE)) {
      continue;
    }

    const details = extractQuestionDetails(group);
    if (!details || details.options.length < 2) {
      continue;
    }

    const mountPoint = createHelperUi(details);
    group.insertAdjacentElement("afterend", mountPoint);
    group.setAttribute(ENHANCED_ATTRIBUTE, "true");
  }
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

  if (!options.length) {
    return null;
  }

  return { question, options };
}

function createHelperUi(details) {
  const wrapper = document.createElement("section");
  wrapper.className = "study-helper";
  wrapper.setAttribute(PANEL_ATTRIBUTE, "true");

  const button = document.createElement("button");
  button.type = "button";
  button.className = "study-helper__button";
  button.textContent = "Explain with AI";

  const status = document.createElement("p");
  status.className = "study-helper__status";
  status.hidden = true;

  const output = document.createElement("div");
  output.className = "study-helper__output";
  output.hidden = true;

  button.addEventListener("click", async () => {
    button.disabled = true;
    status.hidden = false;
    status.textContent = "Generating explanation...";
    output.hidden = true;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "explain-question",
        payload: details
      });

      if (!response?.ok) {
        throw new Error(response?.error || "Request failed.");
      }

      output.textContent = response.result;
      output.hidden = false;
      status.textContent = "Explanation ready.";
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : "Unable to explain this question.";
    } finally {
      button.disabled = false;
    }
  });

  wrapper.append(button, status, output);
  return wrapper;
}

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}
