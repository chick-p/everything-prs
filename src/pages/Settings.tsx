import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout";

export const Settings: FC = async () => {
  return (
    <Layout title="Preference">
      <div class="c-preference">
        <div>
          <label id="token" class="c-preference-label">
            GitHub API Token
          </label>
          <span class="c-preference-hint js-hidden js-gh-token-hint">
            Enter a value only if you want to change it
          </span>
          <input
            id="gh-token"
            name="gh-token"
            type="password"
            class="js-gh-token no-margin-top"
          />
        </div>
        <div>
          <input
            id="include-orgs"
            name="include-orgs"
            type="checkbox"
            class="js-include-orgs"
          />
          <label for="include-orgs">Include organization repositories</label>
        </div>
        <div>
          <button class="js-save" type="submit">
            Save
          </button>
          <span class="js-hidden js-save-message">Saved!</span>
          <span class="js-hidden js-save-error">
            Failed to save. Please try again.
          </span>
        </div>
      </div>
      <script src="/static/js/settings.js" defer></script>
    </Layout>
  );
};
