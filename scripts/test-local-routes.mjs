// Automated test script for Cinevo local dev server
const BASE_URL = 'http://localhost:3000';

const routesToTest = [
  { path: '/', label: 'Home Page (Rotating Hero + Rows)' },
  { path: '/discover', label: 'Discover & Genre Explorer' },
  { path: '/movies', label: 'Movies Catalog (Infinite Scroll)' },
  { path: '/series', label: 'TV Series Catalog' },
  { path: '/movie/550', label: 'Movie Details (Fight Club)' },
  { path: '/tv/1399', label: 'TV Series Details (Game of Thrones)' },
  { path: '/watch/movie/550', label: 'Movie Watch Player (10 Servers)' },
  { path: '/watch/tv/1399?season=1&episode=1', label: 'TV Watch Player & Episodes' },
  { path: '/my-list', label: 'My List (Watchlist Bookmarks)' },
  { path: '/history', label: 'Playback Watch History' },
  { path: '/profile', label: 'Library & Preferences' },
  { path: '/search', label: 'Search Overlay & Page' },
];

async function runTests() {
  console.log(`\n========================================`);
  console.log(`🎬 Testing Cinevo Local Dev Server at: ${BASE_URL}`);
  console.log(`========================================\n`);

  let passed = 0;
  let failed = 0;

  for (const { path, label } of routesToTest) {
    const url = `${BASE_URL}${path}`;
    const startTime = Date.now();
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'CinevoTestClient/1.0',
          Accept: 'text/html,application/xhtml+xml',
        },
      });

      const elapsed = Date.now() - startTime;
      const html = await res.text();

      if (res.status === 200 && html.length > 500) {
        console.log(`✅ [${res.status}] ${label}`);
        console.log(`   URL: ${path} (${elapsed}ms, ${Math.round(html.length / 1024)} KB)`);
        passed++;
      } else {
        console.error(`❌ [${res.status}] ${label} - Length: ${html.length}`);
        failed++;
      }
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ [ERROR] ${label} (${path}) - ${err.message} (${elapsed}ms)`);
      failed++;
    }
  }

  console.log(`\n----------------------------------------`);
  console.log(`Results: ${passed}/${routesToTest.length} Routes PASSED (Failed: ${failed})`);
  console.log(`----------------------------------------\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
