/**
 * Mission utility helpers
 * Normalizes mission filenames and names derived from backend paths.
 */

/**
 * Extract the mission filename suitable for backend requests.
 * Removes any directory components and trims whitespace.
 */
export const getMissionRequestFilename = (
  ...candidates: Array<string | null | undefined>
): string | undefined => {
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }

    const trimmed = `${candidate}`.trim();
    if (!trimmed) {
      continue;
    }

    const normalized = trimmed.replace(/\\/g, "/");
    const segments = normalized.split("/").filter(Boolean);
    if (!segments.length) {
      continue;
    }

    const base = segments[segments.length - 1];
    if (base) {
      return base;
    }
  }

  return undefined;
};

/**
 * Derive a mission name (without .db) from one or more possible inputs.
 */
export const getMissionNameFromFilename = (
  ...candidates: Array<string | null | undefined>
): string | undefined => {
  const filename = getMissionRequestFilename(...candidates);
  if (!filename) {
    return undefined;
  }

  return filename.replace(/\.db$/i, "");
};
