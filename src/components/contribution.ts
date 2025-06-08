import { html } from "hono/html";

import { GitHub } from "../lib/github";

export const TodayContributionHtml = async (props: {
  token: string;
  timeZone: string;
}) => {
  const { token, timeZone = "Asia/Tokyo" } = props;

  // The sv-SE locale returns date strings in YYYY-MM-DD format.
  const todayString = new Date()
    .toLocaleDateString("sv-SE", {
      timeZone,
    })
    .split("T")[0];

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
