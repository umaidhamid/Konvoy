// Lightweight, dependency-free user-agent labeling - good enough for "which
// device is this" in a sessions list, not meant to be exhaustive.

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\//, "Opera"],
  [/Chrome\//, "Chrome"],
  [/Firefox\//, "Firefox"],
  [/Safari\//, "Safari"],
];

const PLATFORMS: [RegExp, string][] = [
  [/Windows/, "Windows"],
  [/Mac OS X/, "macOS"],
  [/Android/, "Android"],
  [/iPhone|iPad|iOS/, "iOS"],
  [/Linux/, "Linux"],
];

export function describeUserAgent(userAgent: string): string {
  if (!userAgent) return "Unknown device";

  const browser = BROWSERS.find(([re]) => re.test(userAgent))?.[1] || "Unknown browser";
  const platform = PLATFORMS.find(([re]) => re.test(userAgent))?.[1] || "Unknown OS";

  return `${browser} on ${platform}`;
}
