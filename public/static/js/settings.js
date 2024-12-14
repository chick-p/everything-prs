{
  window.addEventListener("DOMContentLoaded", (_) => {
    const ghTokenInput = document.querySelector(".js-gh-token");

    const localStorageKey = "everything-prs";
    const localStorageValue = localStorage.getItem(localStorageKey) || "{}";
    const settings = JSON.parse(localStorageValue);
    ghTokenInput?.setAttribute("value", settings["gh-token"] || "");

    const saveButton = document.querySelector(".js-save");
    saveButton.addEventListener("click", (_) => {
      const apiKey = ghTokenInput?.value || "";
      const repos = settings["repos"] || [];

      const newSettings = {
        ...settings,
        repos,
        "gh-token": apiKey,
      };
      localStorage.setItem(localStorageKey, JSON.stringify(newSettings));
      document.querySelector(".js-save-message")?.classList.remove("js-hidden");
    });
  });
}
