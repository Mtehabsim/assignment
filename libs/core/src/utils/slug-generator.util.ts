/**
 * Utility for generating URL-safe slugs with full Unicode support
 * Supports Arabic, English, and other Unicode characters
 */
export class SlugGenerator {
  /**
   * Generate a URL-safe slug from a title
   *
   * Features:
   * - Preserves Arabic and other Unicode letters
   * - Converts spaces to hyphens
   * - Removes special characters
   * - Handles multiple consecutive spaces/underscores
   * - Trims leading/trailing hyphens
   * - Limits length to 255 characters
   *
   * @param title - The title to convert to a slug
   * @returns URL-safe slug
   *
   * @example
   * SlugGenerator.generate('بودكاست فنجان') // returns 'بودكاست-فنجان'
   * SlugGenerator.generate('Hello World!') // returns 'hello-world'
   * SlugGenerator.generate('  Test___Slug  ') // returns 'test-slug'
   */
  static generate(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "") // Keep Unicode letters, numbers, spaces, underscores, hyphens
      .replace(/[\s_]+/g, "-") // Convert spaces/underscores to single hyphen
      .replace(/-+/g, "-") // Collapse multiple hyphens to single hyphen
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens
      .substring(0, 255); // Limit length
  }
}
