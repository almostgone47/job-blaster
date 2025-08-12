import express from 'express';
import rateLimit from 'express-rate-limit';
import * as cheerio from 'cheerio';

const router = express.Router();
const limiter = rateLimit({windowMs: 60_000, max: 10});

router.post('/jobs/parse-url', limiter, async (req, res) => {
  const {url} = req.body ?? {};
  if (!url) return res.status(400).json({error: 'url required'});

  try {
    // Use global fetch (Node 18+)
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 5000);
    const resp = await fetch(url, {
      headers: {'User-Agent': 'Mozilla/5.0'},
      signal: ctrl.signal,
    } as any);
    clearTimeout(timeoutId);

    const html = await resp.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twTitle = $('meta[name="twitter:title"]').attr('content');
    const titleTag = $('title').text().trim();
    const titleGuess = ogTitle || twTitle || titleTag || '';

    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const parts = titleGuess.split(/[-–|•]/).map((s) => s?.trim() || '');
    const title = parts[0] || titleGuess || hostname;
    const company = parts[1] || hostname.split('.')[0];

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}`;

    res.json({title, company, source: hostname, faviconUrl});
  } catch {
    const host = new URL(url).hostname.replace(/^www\./, '');
    res.json({title: '', company: host.split('.')[0], source: host});
  }
});

export default router;
