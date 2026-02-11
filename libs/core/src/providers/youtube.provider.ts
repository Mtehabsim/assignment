import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { google, youtube_v3 } from "googleapis";
import {
  IExternalProvider,
  ProgramDetails,
  SearchResult,
} from "../interfaces/external-provider.interface";
import { YouTubeMetadata } from "../interfaces/provider-metadata.interface";

/**
 * Strategy Pattern Implementation: YouTube Provider
 * Open/Closed: Can be extended without modifying existing code
 * Single Responsibility: Only handles YouTube logic
 * Dependency Inversion: Implements IExternalProvider contract
 */
@Injectable()
export class YouTubeProvider implements IExternalProvider {
  private readonly logger = new Logger(YouTubeProvider.name);
  private youtube: youtube_v3.Youtube;
  private channelId: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>("YOUTUBE_API_KEY");
    this.channelId =
      this.configService.get<string>("YOUTUBE_CHANNEL_ID") ||
      "UCF2JlBUzfP2lqhI0P-vFEKA";

    if (!apiKey) {
      throw new Error("YOUTUBE_API_KEY is not set in environment variables");
    }
    if (!this.channelId) {
      throw new Error("YOUTUBE_CHANNEL_ID is not set in environment variables");
    }

    this.youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      this.logger.log(
        `Searching for "${query}" in channel ${this.channelId}, limit: ${limit}`,
      );

      const response = await this.youtube.search.list({
        part: ["snippet"],
        q: query,
        channelId: this.channelId,
        maxResults: limit,
        type: ["video"],
        fields: "items(id,snippet(title,thumbnails,channelTitle))",
      });

      this.logger.log(
        `Search response: ${response.data.items?.length || 0} items, status ${response.status}`,
      );

      if (!response.data.items || response.data.items.length === 0) {
        this.logger.log(`No items found for query: ${query}`);
        return [];
      }

      const results = response.data.items.map(
        (item: youtube_v3.Schema$SearchResult) => ({
          externalId: item.id?.videoId || "",
          title: item.snippet?.title || "Untitled",
          thumbnail: item.snippet?.thumbnails?.default?.url || "",
          duration: 0, // Duration requires separate API call via videos.list
          provider: "YOUTUBE",
        }),
      );

      this.logger.log(`Returning ${results.length} results`);
      return results;
    } catch (error) {
      this.logger.error("YouTube search failed:", error);
      throw new ServiceUnavailableException(
        `YouTube search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async fetchDetails(videoId: string): Promise<ProgramDetails> {
    try {
      const response = await this.youtube.videos.list({
        part: ["snippet", "contentDetails", "statistics"],
        id: [videoId],
        fields:
          "items(id,snippet(title,description,thumbnails,channelTitle,publishedAt),contentDetails(duration),statistics(viewCount))",
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new NotFoundException(`Video not found: ${videoId}`);
      }

      const video = response.data.items[0];
      const duration = this.parseDuration(
        video.contentDetails?.duration || "PT0S",
      );

      return {
        externalId: videoId,
        title: video.snippet?.title || "Untitled",
        description: video.snippet?.description || "",
        duration_seconds: duration,
        thumbnail: video.snippet?.thumbnails?.default?.url || "",
        provider: "YOUTUBE",
        source_metadata: {
          videoId,
          channel: video.snippet?.channelTitle || "",
          uploadedAt: video.snippet?.publishedAt || new Date().toISOString(),
          viewCount: video.statistics?.viewCount || "0",
          duration_iso: video.contentDetails?.duration,
        } as YouTubeMetadata,
      };
    } catch (error) {
      this.logger.error("YouTube fetch details failed:", error);
      // Re-throw NotFoundException as-is
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        `Failed to fetch video details: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Parse ISO 8601 duration format (PT1H30M45S) to seconds
   */
  private parseDuration(duration: string): number {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);

    if (!matches) return 0;

    const hours = parseInt(matches[1] || "0", 10);
    const minutes = parseInt(matches[2] || "0", 10);
    const seconds = parseInt(matches[3] || "0", 10);

    return hours * 3600 + minutes * 60 + seconds;
  }
}
