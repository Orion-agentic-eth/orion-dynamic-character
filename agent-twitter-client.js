import { Scraper } from "agent-twitter-client";
import dotenv from "dotenv";

dotenv.config();

export async function fetchProfileAndPinnedTweets(username) {
  try {
    console.log("Initializing scraper...");
    const scraper = new Scraper();

    console.log("Logging in with username:", process.env.TWITTER_USERNAME);
    await scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD
    );
    console.log("Login successful.");

    console.log("Fetching profile for username:", username);
    const profile = await scraper.getProfile(username);
    console.log("Profile fetched:", profile);

    const pinnedTweetIds = profile.pinnedTweetIds || [];
    console.log("Pinned tweet IDs:", pinnedTweetIds);

    console.log("Fetching details for pinned tweets...");
    const pinnedTweetDetails = await Promise.all(
      pinnedTweetIds.map(async (tweetId) => {
        console.log("Fetching tweet with ID:", tweetId);
        const tweet = await scraper.getTweet(tweetId);
        console.log("Tweet details:", tweet);
        return {
          id: tweet.id,
          html: tweet.html,
          hashtags: tweet.hashtags,
        };
      })
    );
    console.log("Pinned tweet details fetched:", pinnedTweetDetails);

    return { profile, pinnedTweetDetails };
  } catch (error) {
    console.error("Failed to fetch profile and pinned tweets:", error);
    throw error;
  }
}
