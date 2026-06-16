import { getR2DownloadUrl, getR2PublicUrl, listR2, type R2Item } from "./r2";

export interface StorageItem {
  name: string;
  isFolder: boolean;
  size?: number;
  lastModified?: string;
  url?: string;
}

const hasPublicBase = Boolean((import.meta.env.VITE_R2_PUBLIC_URL as string | undefined)?.trim());

function joinPath(base: string, name: string): string {
  if (!base) return name;
  return `${base.replace(/\/+$/, "")}/${name}`;
}

// VITE_R2_SECTIONS lets the frontend map logical section names to R2 path prefixes
// inside the single configured bucket. Format: "resources:,examNotes:entrance"
// Default: "resources" -> bucket root, "examNotes" -> "entrance/"
// Set VITE_R2_SECTIONS=examNotes: to disable a section.
function getSectionMap(): Record<string, string> {
  const raw = (import.meta.env.VITE_R2_SECTIONS as string | undefined)?.trim();
  if (!raw) {
    return { resources: "", examNotes: "entrance/" };
  }
  const map: Record<string, string> = {};
  for (const part of raw.split(",")) {
    const [name, prefix] = part.split(":").map((s) => (s ?? "").trim());
    if (!name) continue;
    map[name] = (prefix ?? "").replace(/^\/+/, "");
    if (map[name] && !map[name].endsWith("/")) map[name] += "/";
  }
  return map;
}

function sectionPrefix(section: string): string {
  const map = getSectionMap();
  if (section in map) return map[section];
  return `${section.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

function buildKey(section: string, path: string): string {
  const prefix = sectionPrefix(section);
  const suffix = path ? `${path.replace(/^\/+/, "")}` : "";
  return `${prefix}${suffix}`;
}

function toStorageItem(it: R2Item, key: string): StorageItem {
  if (it.isFolder) {
    return { name: it.name, isFolder: true, size: it.size, lastModified: it.lastModified };
  }
  const url = hasPublicBase ? getR2PublicUrl(key) : undefined;
  return { name: it.name, isFolder: false, size: it.size, lastModified: it.lastModified, url };
}

export function isSectionEnabled(section: string): boolean {
  return sectionPrefix(section).length > 0 || section === "resources";
}

export async function getStorageItems(
  section: string,
  path = ""
): Promise<StorageItem[]> {
  if (!section) return [];
  const prefix = sectionPrefix(section);
  if (!prefix && section !== "resources") return [];
  try {
    const items = await listR2(buildKey(section, path));
    return items.map((it) => toStorageItem(it, buildKey(section, joinPath(path, it.name))));
  } catch (err) {
    console.error(`getStorageItems: r2 list failed for section "${section}"`, err);
    return [];
  }
}

export async function resolveFileUrl(section: string, filePath: string): Promise<string> {
  if (!section || !filePath) {
    throw new Error("Section and file path are required");
  }
  const key = buildKey(section, filePath);
  if (hasPublicBase) return getR2PublicUrl(key);
  return getR2DownloadUrl(key);
}

export function getFileUrl(section: string, filePath: string): string {
  if (!section || !filePath) {
    throw new Error("Section and file path are required");
  }
  return getR2PublicUrl(buildKey(section, filePath));
}
