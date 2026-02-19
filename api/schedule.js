export default async function handler(req, res) {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Missing date parameter" });
  }

  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${date}`;
    
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
