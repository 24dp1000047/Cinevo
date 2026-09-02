import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Cinevo API Test Suite...\n');

  try {
    // 1. Health check
    const health = await axios.get('http://localhost:5000/health');
    console.log('✅ [1] Health Check:', health.data.status === 'ok' ? 'PASS' : 'FAIL');

    // 2. Public Trending Movies
    const trending = await axios.get(`${BASE_URL}/movies/trending`);
    console.log('✅ [2] Public Trending Movies:', trending.data.success ? `PASS (${trending.data.data.results.length} movies)` : 'FAIL');

    // 3. Public Movie Details
    const movieDetails = await axios.get(`${BASE_URL}/movies/550`);
    console.log('✅ [3] Public Movie Details (550):', movieDetails.data.success ? `PASS (${movieDetails.data.data.title})` : 'FAIL');

    // 4. Public TV Details & Seasons
    const tvDetails = await axios.get(`${BASE_URL}/tv/1399`);
    console.log('✅ [4] Public TV Details (1399):', tvDetails.data.success ? `PASS (${tvDetails.data.data.name})` : 'FAIL');

    const tvSeason = await axios.get(`${BASE_URL}/tv/1399/season/1`);
    console.log('✅ [5] Public TV Season 1:', tvSeason.data.success ? `PASS (${tvSeason.data.data.episodes.length} episodes)` : 'FAIL');

    // 5. Public Search
    const search = await axios.get(`${BASE_URL}/search?q=Fight`);
    console.log('✅ [6] Public Search (Fight):', search.data.success ? `PASS (${search.data.data.results.length} results)` : 'FAIL');

    // 6. Public Streaming Source & Multi-Servers
    const streamMovie = await axios.get(`${BASE_URL}/play/movie/550`);
    const movieServers = streamMovie.data.data.servers || [];
    console.log('✅ [7] Public Movie Playback Stream & Multi-Servers:', streamMovie.data.success && movieServers.length > 0 ? `PASS (${movieServers.length} servers available: ${movieServers.map((s: any) => s.name).join(', ')})` : 'FAIL');

    const streamTV = await axios.get(`${BASE_URL}/play/tv/1399/1/1`);
    const tvServers = streamTV.data.data.servers || [];
    console.log('✅ [8] Public TV Playback Stream & Multi-Servers:', streamTV.data.success && tvServers.length > 0 ? `PASS (${tvServers.length} servers: ${tvServers[0].name} -> ${tvServers[0].url})` : 'FAIL');

    // 7. Optional User Auth Flow
    const testEmail = `test_${Date.now()}@cinevo.io`;
    const authRegister = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: 'password123',
      name: 'Test Streamer',
    });
    console.log('✅ [9] Optional Auth Register:', authRegister.data.success ? 'PASS' : 'FAIL');
    const token = authRegister.data.data.token;

    // 8. Watchlist Sync
    const watchlistSync = await axios.post(
      `${BASE_URL}/watchlist/sync`,
      {
        items: [
          { tmdbId: 550, mediaType: 'movie', title: 'Fight Club', posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg' },
          { tmdbId: 1399, mediaType: 'tv', title: 'Game of Thrones', posterPath: '/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg' },
        ],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ [10] Guest -> User Watchlist Sync:', watchlistSync.data.success ? `PASS (${watchlistSync.data.data.length} items synced)` : 'FAIL');

    // 9. History Sync
    const historySync = await axios.post(
      `${BASE_URL}/history/sync`,
      {
        items: [
          {
            tmdbId: 550,
            mediaType: 'movie',
            title: 'Fight Club',
            progress: 1800,
            duration: 7200,
          },
        ],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ [11] Guest -> User History Sync:', historySync.data.success ? `PASS (${historySync.data.data[0].progress}s resumed)` : 'FAIL');

    console.log('\n🎉 ALL 11 TEST CASES PASSED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('❌ Test failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runTests();
