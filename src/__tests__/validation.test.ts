import { validatePost } from "../utils/validation";

export function runValidationTests() {
  console.log("Running Experiment 1.4.2 Unit Tests for Post Validation...");

  const validTwitter = validatePost("Twitter", "Short tweet text", undefined);
  if (!validTwitter.valid) {
    throw new Error("Twitter valid post test failed");
  }

  const invalidTwitter = validatePost("Twitter", "a".repeat(281), undefined);
  if (invalidTwitter.valid) {
    throw new Error("Twitter character limit test failed");
  }

  const textOnlyInstagram = validatePost("Instagram", "Caption without image", undefined);
  if (textOnlyInstagram.valid) {
    throw new Error("Instagram image requirement test failed");
  }

  const validInstagram = validatePost("Instagram", "Caption with image", ["data:image/png;base64,sample"]);
  if (!validInstagram.valid) {
    throw new Error("Instagram with image test failed");
  }

  const validLinkedIn = validatePost("LinkedIn", "Professional article post", undefined);
  if (!validLinkedIn.valid) {
    throw new Error("LinkedIn validation test failed");
  }

  console.log("All Experiment 1.4.2 Unit Tests Passed Successfully!");
  return true;
}
