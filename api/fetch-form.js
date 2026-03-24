module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const url = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  if (!url) {
    res.status(400).json({ error: "Missing Google Form URL." });
    return;
  }

  let targetUrl;

  try {
    targetUrl = new URL(url);
  } catch {
    res.status(400).json({ error: "Invalid URL." });
    return;
  }

  const isGoogleFormsHost =
    targetUrl.hostname === "docs.google.com" &&
    targetUrl.pathname.startsWith("/forms/");

  if (!isGoogleFormsHost) {
    res.status(400).json({ error: "Use a public docs.google.com/forms URL." });
    return;
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": "GoogleFormsStudyHelper/1.0"
      }
    });

    const html = await response.text();
    if (!response.ok) {
      res.status(response.status).json({
        error: "Google Forms returned an error for that URL."
      });
      return;
    }

    res.status(200).json({ html });
  } catch {
    res.status(502).json({
      error: "Unable to fetch that form right now. Make sure it is public."
    });
  }
};
