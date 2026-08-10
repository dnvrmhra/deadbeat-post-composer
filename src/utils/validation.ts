import type { Validation } from "../types/Validation";

const limits: Record<string, number> = {
  Twitter: 280,
  Instagram: 2200,
  LinkedIn: 3000,
  Facebook: 63206,
};

export function getCharacterLimit(
  platform: string
): number {
  return limits[platform];
}

export function validatePost(
  platform: string,
  content: string,
  image?: string
): Validation {
  const limit = limits[platform];

  if (content.trim() === "") {
    return {
      valid: false,
      message: "Post cannot be empty.",
    };
  }

  if (
    platform === "Instagram" &&
    (!image || image.trim() === "")
  ) {
    return {
      valid: false,
      message: "Instagram posts require an image.",
    };
  }

  if (content.length > limit) {
    return {
      valid: false,
      message: `Maximum ${limit} characters allowed.`,
    };
  }

  if (content.length > limit * 0.9) {
    return {
      valid: true,
      message: "Approaching character limit.",
    };
  }

  return {
    valid: true,
    message: "Ready to publish ✓",
  };
}