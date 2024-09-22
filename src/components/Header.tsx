import type { FC } from "hono/jsx";

type Props = {
  title: string;
};
export const Header: FC<Props> = (props: Props) => {
  return (
    <header class="c-header">
      <h1><a href="/"  class="c-header-title__link">{props.title}</a></h1>
      <ul class="c-header-list">
        <li>
          <a href="/repos">Repository</a>
        </li>
        <li>
          <a href="/settings">Preference</a>
        </li>
      </ul>
    </header>
  );
};
