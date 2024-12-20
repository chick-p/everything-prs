import packageJson from "../../package.json";
import type { FC } from "hono/jsx";
import { Header } from "./Header";
const appName = packageJson.name;

export const Layout: FC = (props) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="/static/css/style.css"
          rel="stylesheet"
          type="text/css"
          media="all"
        />
        <title>{appName}</title>
      </head>
      <body>
        <Header title={appName} />
        <main class="c-content">{props.children}</main>
      </body>
    </html>
  );
};
