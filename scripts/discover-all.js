/**
 * Master Discovery Script
 * Runs all discovery sources (YouTube, Twitter, etc.)
 */

const { discoverYouTube } = require('./discover-youtube');
const { discoverTwitter } = require('./discover-twitter');

async function discoverAll() {
  console.log('🚀 Starting multi-source discovery...\n');
  console.log('=' . repeat(50));

  const results = {
    youtube: null,
    twitter: null,
    total: { discovered: 0, inserted: 0, duplicates: 0 },
  };

  try {
    // YouTube Discovery
    console.log('\n📺 YOUTUBE DISCOVERY');
    console.log('=' . repeat(50));
    results.youtube = await discoverYouTube();
    results.total.discovered += results.youtube.discovered;
    results.total.inserted += results.youtube.inserted;
    results.total.duplicates += results.youtube.duplicates;
  } catch (error) {
    console.error('YouTube discovery failed:', error.message);
  }

  try {
    // Twitter Discovery
    console.log('\n🐦 TWITTER DISCOVERY');
    console.log('=' . repeat(50));
    results.twitter = await discoverTwitter();
    results.total.discovered += results.twitter.discovered;
    results.total.inserted += results.twitter.inserted;
    results.total.duplicates += results.twitter.duplicates;
  } catch (error) {
    console.error('Twitter discovery failed:', error.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TOTAL RESULTS');
  console.log('='.repeat(50));
  console.log(`✓ Total Discovered: ${results.total.discovered}`);
  console.log(`✓ Total Inserted: ${results.total.inserted}`);
  console.log(`✓ Total Duplicates: ${results.total.duplicates}`);
  console.log('='.repeat(50) + '\n');

  return results;
}

// Run if called directly
if (require.main === module) {
  discoverAll()
    .then(() => {
      console.log('✅ Discovery complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { discoverAll };
