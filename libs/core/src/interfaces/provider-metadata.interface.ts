/**
 * Provider-specific metadata type definitions
 * Provides type safety for source_metadata field instead of Record<string, any>
 */

/**
 * YouTube video metadata structure
 */
export interface YouTubeMetadata {
  /** YouTube video ID */
  videoId: string;

  /** Channel name */
  channel: string;

  /** ISO 8601 upload timestamp */
  uploadedAt: string;

  /** View count as string (YouTube API returns strings for large numbers) */
  viewCount: string;

  /** ISO 8601 duration format (e.g., "PT1H30M45S") */
  duration_iso?: string;
}

/**
 * Union type for all supported provider metadata
 * Extensible for future providers (Vimeo, Twitch, etc.)
 */
export type ProviderMetadata = YouTubeMetadata | Record<string, unknown>;

/**
 * Type guard to check if metadata is YouTube-specific
 */
export function isYouTubeMetadata(
  metadata: ProviderMetadata,
): metadata is YouTubeMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "videoId" in metadata &&
    "channel" in metadata &&
    "uploadedAt" in metadata
  );
}
