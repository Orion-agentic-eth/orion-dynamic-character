import { Scraper } from "agent-twitter-client";
import dotenv from "dotenv";

dotenv.config();

export async function fetchProfileAndPinnedTweets(username) {
  try {
    const scraper = new Scraper();

    await scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD
    );

    const profile = await scraper.getProfile(username);
    const pinnedTweetIds = profile.pinnedTweetIds || [];

    const pinnedTweetDetails = await Promise.all(
      pinnedTweetIds.map(async (tweetId) => {
        const tweet = await scraper.getTweet(tweetId);
        return {
          id: tweet.id,
          html: tweet.html,
          hashtags: tweet.hashtags,
        };
      })
    );
    console.log(pinnedTweetDetails);
    return { profile, pinnedTweetDetails };
  } catch (error) {
    console.error("Failed to fetch profile and pinned tweets:", error);
    throw error;
  }
}
