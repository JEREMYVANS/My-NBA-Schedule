export default async function handler(req, res) {
  try {
    const url = "https://site.web.api.espn.com/apis/v2/sports/basketball/nba/standings?region=us&lang=en&contentorigin=espn";

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "ESPN API error" });
    }

    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
