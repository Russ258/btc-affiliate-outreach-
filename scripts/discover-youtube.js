/**
 * YouTube Discovery Script (No API Required)
 * Uses yt-dlp to discover Bitcoin/crypto YouTube creators
 */

const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const SEARCH_QUERIES = [
  'bitcoin podcast',
  'bitcoin investing',
  'crypto education',
  'cryptocurrency news',
  'bitcoin analysis',
  'crypto trading',
  'bitcoin conference',
  'blockchain technology',
];

const RESULTS_PER_QUERY = 30;

async function searchYouTube(query, limit) {
  console.log(`Searching YouTube for: "${query}"...`);

  try {
    const cmd = `yt-dlp "ytsearch${limit}:${query}" -J --flat-playlist`;
    const output = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const data = JSON.parse(output);

    return data.entries || [];
  } catch (error) {
    console.error(`Error searching for "${query}":`, error.message);
    return [];
  }
}

async function discoverYouTube() {
  console.log('🔍 Starting YouTube discovery...\n');

  let discovered = 0;
  let inserted = 0;
  let duplicates = 0;

  for (const query of SEARCH_QUERIES) {
    const entries = await searchYouTube(query, RESULTS_PER_QUERY);

    for (const entry of entries) {
      const channelName = entry.channel || entry.uploader;
      const channelUrl = entry.channel_url || entry.uploader_url;
      const videoTitle = entry.title;

      if (!channelName || !channelUrl) continue;

      discovered++;

      // Extract follower count if available
      const followerCount = entry.channel_follower_count || entry.subscriber_count || null;

      // Insert into prospects table
      const { data, error } = await supabase
        .from('prospects')
        .insert([{
          name: channelName,
          youtube_channel: channelName,
          youtube_url: channelUrl,
          source: 'youtube',
          follower_count: followerCount,
          bio: videoTitle, // Use video title as bio for now
          status: 'new',
          confidence: followerCount > 10000 ? 'HIGH' : 'MEDIUM',
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
        console.log(`✓ Added: ${channelName} (${followerCount || 'unknown'} followers)`);
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
  discoverYouTube()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { discoverYouTube };
