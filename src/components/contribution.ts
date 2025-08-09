import { html } from "hono/html";

import { GitHub } from "../lib/github";

export const TodayContributionHtml = async (props: {
  token: string;
  tz?: string;
}) => {
  const { token, tz } = props;

  const today = new Date();
  const timeZone = tz || "Asia/Tokyo";
  // sv locale returs YYYY-MM-DD format
  const todayString = new Intl.DateTimeFormat("sv", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
  const client = new GitHub({ token });
  const { login: username } = await client.getMe();
  const { contributionCalendar } = await client.fetchContributes({
    username,
    today: todayString,
  });
  const { weeks } = contributionCalendar;
  const todayContribution = weeks[0].contributionDays[0];

  return html`
    <section>
      <div>
        Today's contribution
        ${todayContribution.contributionCount > 0 ? "✅" : "🚫"}
      </div>
    </section>
  `;
};
