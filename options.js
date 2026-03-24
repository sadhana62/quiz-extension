const form = document.querySelector("#settings-form");
const apiKeyInput = document.querySelector("#api-key");
const statusText = document.querySelector("#status");

loadSettings();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const geminiApiKey = apiKeyInput.value.trim();

  await chrome.storage.sync.set({
    geminiApiKey
  });

  statusText.textContent = "Settings saved.";
});

async function loadSettings() {
  const { geminiApiKey } = await chrome.storage.sync.get({
    geminiApiKey: ""
  });

  apiKeyInput.value = geminiApiKey;
}
