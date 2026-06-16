export interface R2Item {
  name: string;
  isFolder: boolean;
  size?: number;
  lastModified?: string;
}

export interface R2ListResult {
  folders: R2Item[];
  files: R2Item[];
  nextContinuationToken: string | null;
  isTruncated: boolean;
}

const API_BASE = "/api/r2";

function publicUrlBase(): string {
  const base = import.meta.env.VITE_R2_PUBLIC_URL as string | undefined;
  return (base ?? "").replace(/\/+$/, "");
}

export function getR2PublicUrl(key: string): string {
  const base = publicUrlBase();
  const cleanKey = key.replace(/^\/+/, "");
  if (!base) return cleanKey;
  return `${base}/${cleanKey}`;
}

export async function listR2(prefix: string): Promise<R2Item[]> {
  const url = `${API_BASE}/list?prefix=${encodeURIComponent(prefix)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`List failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as R2ListResult;
  return [...(data.folders ?? []), ...(data.files ?? [])];
}

function splitKey(key: string): { prefix: string; name: string } {
  const k = key.replace(/^\/+/, "");
  const i = k.lastIndexOf("/");
  if (i === -1) return { prefix: "", name: k };
  return { prefix: k.slice(0, i), name: k.slice(i + 1) };
}

export async function uploadR2File(file: File, key: string): Promise<void> {
  const { prefix, name } = splitKey(key);
  const fd = new FormData();
  if (prefix) fd.append("prefix", prefix);
  fd.append("file", file, name || file.name);
  const res = await fetch(`${API_BASE}/object`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${res.status} ${text}`);
  }
}

export async function deleteR2Keys(keys: string[]): Promise<void> {
  const res = await fetch(`${API_BASE}/object`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Delete failed: ${res.status} ${text}`);
  }
}

export async function getR2DownloadUrl(key: string): Promise<string> {
  const url = `${API_BASE}/object?key=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sign failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}
