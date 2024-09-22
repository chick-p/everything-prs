import type { FC } from "hono/jsx";
import { Layout } from "../components/Layout";

export const Repositories: FC = async () => {
  return (
    <Layout title="Repositories">
      <div id="root">Now Loading...</div>
      <script src="/static/js/repository.js" defer></script>
    </Layout>
  );
};
