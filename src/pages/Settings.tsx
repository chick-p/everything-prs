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
          <input
            id="gh-token"
            name="gh-token"
            type="password"
            class="js-gh-token no-margin-top"
          />
        </div>
        <div>
          <button class="js-save" type="submit">
            Save
          </button>
          <span class="js-hidden js-save-message">Saved!</span>
        </div>
      </div>
      <script src="/static/js/settings.js" defer></script>
    </Layout>
  );
};
