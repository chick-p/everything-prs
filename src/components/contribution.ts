import { html } from "hono/html";

import { GitHub } from "../lib/github";

export const TodayContributionHtml = async (props: { token: string }) => {
  const token = props.token;

  // The sv-SE locale returns date strings in YYYY-MM-DD format.
  const todayString = new Date()
    .toLocaleDateString("sv-SE", {
      timeZone: "Asia/Tokyo",
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
