import { Layout } from "../components/Layout";
import { FC } from "hono/jsx";

export const Home: FC = () => {
  return (
    <Layout>
      <div id="root">
        <span class="c-main-content__loading-icon"></span>
        <span> Now Loading...</span>
      </div>
      <script src="/static/js/home.js" defer></script>
    </Layout>
  );
};
