{
  window.addEventListener("DOMContentLoaded", async (_) => {
    const localStorageKey = "everything-prs";
    const localStorageValue = localStorage.getItem(localStorageKey) || "{}";
    const settings = JSON.parse(localStorageValue);

    const ghToken = settings["gh-token"];
    if (!ghToken) {
      window.location.href = "/settings";
      return;
    }
    const repos = settings["repos"] || {};

    const result = await fetch("/prs", {
      method: "POST",
      headers: {
        "everything-prs-token": ghToken,
      },
      body: JSON.stringify({
        repos,
      }),
    });
    const prs = await result.text();
    document.querySelector("#root").innerHTML = prs;
  });
}
