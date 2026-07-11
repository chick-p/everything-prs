{
  window.addEventListener("DOMContentLoaded", (_) => {
    const ghTokenInput = document.querySelector(".js-gh-token");
    const ghTokenHint = document.querySelector(".js-gh-token-hint");
    const includeOrgsInput = document.querySelector(".js-include-orgs");

    const localStorageKey = "everything-prs";
    const localStorageValue = localStorage.getItem(localStorageKey) || "{}";
    const settings = JSON.parse(localStorageValue);
    const hasExistingToken = Boolean(settings["gh-token"]);
    if (ghTokenInput) {
      ghTokenInput.setAttribute(
        "placeholder",
        hasExistingToken ? "******" : "",
      );
    }
    if (ghTokenHint) {
      ghTokenHint.classList.toggle("js-hidden", !hasExistingToken);
    }
    if (includeOrgsInput) {
      includeOrgsInput.checked = settings["include-orgs"] || false;
    }

    async function encryptToken(token) {
      const response = await fetch("/api/token/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        return null;
      }
      const { encrypted } = await response.json();
      return encrypted;
    }

    function saveSettings(newSettings) {
      localStorage.setItem(localStorageKey, JSON.stringify(newSettings));
    }

    function showSaveResult(ok) {
      document
        .querySelector(".js-save-error")
        ?.classList.toggle("js-hidden", ok);
      document
        .querySelector(".js-save-message")
        ?.classList.toggle("js-hidden", !ok);
    }

    const saveButton = document.querySelector(".js-save");
    saveButton.addEventListener("click", async (_) => {
      const inputValue = ghTokenInput?.value || "";
      const repos = settings["repos"] || [];

      let ghToken = settings["gh-token"] || "";
      if (inputValue) {
        const encrypted = await encryptToken(inputValue);
        if (encrypted === null) {
          showSaveResult(false);
          return;
        }
        ghToken = encrypted;
      }

      saveSettings({
        ...settings,
        repos,
        "gh-token": ghToken,
        "include-orgs": includeOrgsInput?.checked || false,
      });
      showSaveResult(true);
    });
  });
}
