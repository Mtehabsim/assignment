import { SlugGenerator } from "../slug-generator.util";

describe("SlugGenerator", () => {
  describe("generate()", () => {
    it("should preserve Arabic characters", () => {
      const result = SlugGenerator.generate("بودكاست فنجان");
      expect(result).toBe("بودكاست-فنجان");
    });

    it("should convert English text to lowercase with hyphens", () => {
      const result = SlugGenerator.generate("Hello World");
      expect(result).toBe("hello-world");
    });

    it("should handle mixed Arabic and English", () => {
      const result = SlugGenerator.generate("بودكاست Tech Talk");
      expect(result).toBe("بودكاست-tech-talk");
    });

    it("should remove special characters", () => {
      const result = SlugGenerator.generate("Hello! World? #Test");
      expect(result).toBe("hello-world-test");
    });

    it("should convert multiple spaces to single hyphen", () => {
      const result = SlugGenerator.generate("Multiple   Spaces   Test");
      expect(result).toBe("multiple-spaces-test");
    });

    it("should convert underscores to hyphens", () => {
      const result = SlugGenerator.generate("Test___Slug___Example");
      expect(result).toBe("test-slug-example");
    });

    it("should trim leading and trailing spaces", () => {
      const result = SlugGenerator.generate("  Trimmed Title  ");
      expect(result).toBe("trimmed-title");
    });

    it("should remove leading and trailing hyphens", () => {
      const result = SlugGenerator.generate("---Test Slug---");
      expect(result).toBe("test-slug");
    });

    it("should handle numbers correctly", () => {
      const result = SlugGenerator.generate("Episode 123 - Season 4");
      expect(result).toBe("episode-123-season-4");
    });

    it("should handle empty string", () => {
      const result = SlugGenerator.generate("");
      expect(result).toBe("");
    });

    it("should handle string with only special characters", () => {
      const result = SlugGenerator.generate("!@#$%^&*()");
      expect(result).toBe("");
    });

    it("should truncate to 255 characters", () => {
      const longTitle = "a".repeat(300);
      const result = SlugGenerator.generate(longTitle);
      expect(result.length).toBe(255);
      expect(result).toBe("a".repeat(255));
    });

    it("should handle real-world podcast title", () => {
      const result = SlugGenerator.generate(
        "فنجان مع عبدالرحمن أبومالح | الحلقة 1",
      );
      expect(result).toBe("فنجان-مع-عبدالرحمن-أبومالح-الحلقة-1");
    });

    it("should preserve hyphens that are part of the original title", () => {
      const result = SlugGenerator.generate("Tech-Talk Episode");
      expect(result).toBe("tech-talk-episode");
    });
  });
});
