import { Layout } from "../components/Layout";
import { FC } from "hono/jsx";

export const Home: FC = () => {
  return (
    <Layout>
      <div id="root">Now Loading...</div>
      <script src="/static/js/home.js" defer></script>
    </Layout>
  );
};
