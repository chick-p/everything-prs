{
  window.addEventListener("DOMContentLoaded", async (_) => {
    const localStorageKey = "everything-prs";
    const localStorageValue = localStorage.getItem(localStorageKey) || "{}";
    const settings = JSON.parse(localStorageValue);

    const ghToken = settings["gh-token"];
    const result = await fetch("/repos", {
      method: "POST",
      headers: {
        "everything-prs-token": ghToken,
      },
    });
    const repos = await result.text();
    document.querySelector("#root").innerHTML = repos;

    const watchedRepos = settings["repos"] || {};
    const checkboxs = document.querySelectorAll(".js_repository_checkbox");
    if (checkboxs) {
      Array.from(checkboxs).forEach((checkbox) => {
        checkbox.checked = watchedRepos[checkbox.name] || false;
      });
    }

    const saveButton = document.querySelector(".js-save");
    saveButton.addEventListener("click", (_) => {
      const newSettings = {
        ...settings,
        repos: Array.from(checkboxs)
          .filter((checkbox) => checkbox.checked)
          .reduce((acc, checkbox) => {
            return { ...acc, [checkbox.name]: checkbox.checked };
          }, {}),
      };
      localStorage.setItem(localStorageKey, JSON.stringify(newSettings));
      document.querySelector(".js-save-message")?.classList.remove("js-hidden");
    });
  });
}
