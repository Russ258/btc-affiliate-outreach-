/**
 * Twitter/X Discovery Script (No API Required)
 * Uses snscrape to discover Bitcoin/crypto influencers
 */

const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SEARCH_QUERIES = [
  'bitcoin',
  'cryptocurrency',
  'crypto trading',
  'blockchain',
  'btc',
  'ethereum',
  'web3',
];

const TWEETS_PER_QUERY = 50; // Fetch recent tweets to find active users

async function searchTwitter(query, limit) {
  console.log(`Searching Twitter for: "${query}"...`);

  try {
    // Use snscrape to search Twitter
    const cmd = `snscrape --jsonl --max-results ${limit} twitter-search "${query} min_faves:100" 2>/dev/null`;
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

    const tweets = output
      .trim()
      .split('\n')
      .filter(line => line)
      .map(line => JSON.parse(line));

    // Extract unique users from tweets
    const users = new Map();
    tweets.forEach(tweet => {
      if (tweet.user && tweet.user.username) {
        users.set(tweet.user.username, {
          username: tweet.user.username,
          name: tweet.user.displayname || tweet.user.username,
          bio: tweet.user.description || '',
          followerCount: tweet.user.followersCount || 0,
          verified: tweet.user.verified || false,
        });
      }
    });

    return Array.from(users.values());
  } catch (error) {
    console.error(`Error searching for "${query}":`, error.message);
    return [];
  }
}

async function discoverTwitter() {
  console.log('🐦 Starting Twitter discovery...\n');

  let discovered = 0;
  let inserted = 0;
  let duplicates = 0;

  for (const query of SEARCH_QUERIES) {
    const users = await searchTwitter(query, TWEETS_PER_QUERY);

    for (const user of users) {
      discovered++;

      // Determine confidence based on follower count
      let confidence = 'LOW';
      if (user.followerCount > 100000) confidence = 'HIGH';
      else if (user.followerCount > 10000) confidence = 'MEDIUM';

      // Insert into prospects table
      const { data, error } = await supabase
        .from('prospects')
        .insert([{
          name: user.name,
          twitter_handle: `@${user.username}`,
          source: 'twitter',
          follower_count: user.followerCount,
          bio: user.bio,
          status: 'new',
          confidence: confidence,
        }])
        .select();

      if (error) {
        if (error.code === '23505') {
          duplicates++;
        } else {
          console.error('Insert error:', error.message);
        }
      } else {
        inserted++;
        console.log(`✓ Added: ${user.name} (@${user.username}) - ${user.followerCount} followers`);
      }
    }
  }

  console.log('\n📊 Discovery Complete!');
  console.log(`   Discovered: ${discovered}`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Duplicates: ${duplicates}`);

  return { discovered, inserted, duplicates };
}

// Run if called directly
if (require.main === module) {
  discoverTwitter()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { discoverTwitter };
