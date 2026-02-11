/**
 * Provider Enums - External content sources
 */
export enum Provider {
  YOUTUBE = "YOUTUBE",
}

export const SUPPORTED_PROVIDERS = Object.values(Provider);

/**
 * Language Enums - Supported languages
 */
export enum Language {
  AR_SA = "ar-SA",
  EN_US = "en-US",
  FR_FR = "fr-FR",
}

export const SUPPORTED_LANGUAGES = Object.values(Language);

/**
 * Program Status Enums
 */
export enum ProgramStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

/**
 * Program Category Enums - Content classification
 */
export enum ProgramCategory {
  PODCAST = "PODCAST", // بودكاست
  DOCUMENTARY = "DOCUMENTARY", // وثائقي
  SERIES = "SERIES", // مسلسل
  INTERVIEW = "INTERVIEW", // مقابلة
  EDUCATIONAL = "EDUCATIONAL", // تعليمي
  NEWS = "NEWS", // إخباري
  ENTERTAINMENT = "ENTERTAINMENT", // ترفيهي
}

export const SUPPORTED_CATEGORIES = Object.values(ProgramCategory);

/**
 * Sort Options for Discovery API
 */
export enum SortOption {
  NEWEST = "newest",
  OLDEST = "oldest",
  DURATION = "duration",
}

export const SUPPORTED_SORT_OPTIONS = Object.values(SortOption);
