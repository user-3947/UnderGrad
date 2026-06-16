import { defineConfig, loadEnv, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { IncomingMessage, ServerResponse } from "http";
import { S3Client } from "@aws-sdk/client-s3";
import { ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Busboy from "busboy";

function sanitizeKey(name: string): string {
  return name.replace(/^\/+/, "").replace(/\.\.+/g, ".");
}

function joinKey(prefix: string, name: string): string {
  const p = prefix.replace(/\/+$/, "");
  const n = sanitizeKey(name);
  return p ? `${p}/${n}` : n;
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

let cachedClient: S3Client | null = null;
function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const region = process.env.R2_REGION ?? "auto";
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 env vars (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).");
  }
  cachedClient = new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
  return cachedClient;
}
function getR2Bucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("Missing R2_BUCKET_NAME env var.");
  return bucket;
}

type Req = IncomingMessage & { query: Record<string, string>; body: unknown };

function setQuery(req: IncomingMessage, url: URL): void {
  (req as Req).query = {};
  for (const [k, v] of url.searchParams.entries()) (req as Req).query[k] = v;
}

async function handleList(req: IncomingMessage, res: ServerResponse, url: URL) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET");
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }
  const rawPrefix = url.searchParams.get("prefix") ?? "";
  const continuationToken = url.searchParams.get("continuationToken") ?? undefined;
  try {
    const client = getR2Client();
    const bucket = getR2Bucket();
    const normalizedPrefix = rawPrefix ? (rawPrefix.endsWith("/") ? rawPrefix : `${rawPrefix}/`) : "";
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: normalizedPrefix,
        Delimiter: "/",
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      }),
    );
    const folders = (result.CommonPrefixes ?? [])
      .map((p) => p.Prefix)
      .filter((p): p is string => Boolean(p))
      .map((p) => ({
        name: p.slice(normalizedPrefix.length).replace(/\/$/, ""),
        isFolder: true as const,
      }));
    const files = (result.Contents ?? [])
      .filter((obj) => obj.Key && obj.Key !== normalizedPrefix)
      .map((obj) => ({
        name: (obj.Key as string).slice(normalizedPrefix.length),
        isFolder: false as const,
        size: obj.Size,
        lastModified: obj.LastModified?.toISOString(),
      }));
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({
      folders,
      files,
      nextContinuationToken: result.NextContinuationToken ?? null,
      isTruncated: Boolean(result.IsTruncated),
    }));
  } catch (err) {
    console.error("r2 list error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: err instanceof Error ? err.message : "List failed" }));
  }
}

async function handleObject(req: IncomingMessage, res: ServerResponse, url: URL) {
  if (req.method === "GET") return signHandler(res, url);
  if (req.method === "POST") return uploadHandler(req, res);
  if (req.method === "DELETE") return deleteHandler(req, res);
  res.statusCode = 405;
  res.setHeader("Allow", "POST, DELETE, GET");
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify({ error: "Method not allowed" }));
}

async function uploadHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    const client = getR2Client();
    const bucket = getR2Bucket();
    const busboy = Busboy({ headers: req.headers });
    const uploaded: { key: string; size: number; contentType: string }[] = [];
    let prefix = "";
    await new Promise<void>((resolve, reject) => {
      busboy.on("field", (name, val) => {
        if (name === "prefix") prefix = sanitizeKey(String(val));
      });
      busboy.on("file", (_fieldname, file, info) => {
        const { filename, mimeType } = info;
        const safeName = filename || "upload.bin";
        const chunks: Buffer[] = [];
        file.on("data", (data: Buffer) => chunks.push(data));
        file.on("limit", () => reject(new Error("File too large")));
        file.on("end", async () => {
          try {
            const body = Buffer.concat(chunks);
            const key = joinKey(prefix, safeName);
            await client.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: body,
                ContentType: mimeType || "application/octet-stream",
              }),
            );
            uploaded.push({ key, size: body.length, contentType: mimeType || "" });
          } catch (err) {
            reject(err);
          }
        });
      });
      busboy.on("error", reject);
      busboy.on("finish", () => resolve());
      req.pipe(busboy);
    });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ uploaded }));
  } catch (err) {
    console.error("r2 upload error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Upload failed" }));
  }
}

async function deleteHandler(req: IncomingMessage, res: ServerResponse) {
  try {
    const client = getR2Client();
    const bucket = getR2Bucket();
    const body = (await readJson(req)) as { key?: string; keys?: string[] };
    const keys: string[] = Array.isArray(body.keys) ? body.keys : body.key ? [body.key] : [];
    if (keys.length === 0) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Provide { key } or { keys: [...] }" }));
    }
    const safe = keys.map((k) => sanitizeKey(String(k)));
    if (safe.length === 1) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: safe[0] }));
    } else {
      await client.send(
        new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: safe.map((Key) => ({ Key })) } }),
      );
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ deleted: safe }));
  } catch (err) {
    console.error("r2 delete error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Delete failed" }));
  }
}

async function signHandler(res: ServerResponse, url: URL) {
  try {
    const client = getR2Client();
    const bucket = getR2Bucket();
    const key = sanitizeKey(url.searchParams.get("key") ?? "");
    if (!key) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "Missing ?key=" }));
    }
    const signed = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 3600 });
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ url: signed }));
  } catch (err) {
    console.error("r2 sign error", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Sign failed" }));
  }
}

function r2ApiPlugin(): Plugin {
  return {
    name: "r2-api-dev",
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/r2/")) return next();
        const parsed = new URL(url, "http://localhost");
        setQuery(req, parsed);
        if (url.startsWith("/api/r2/list")) return handleList(req, res, parsed);
        if (url.startsWith("/api/r2/object")) return handleObject(req, res, parsed);
        return next();
      };
      server.middlewares.use(handler);
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) process.env[k] = v;
  return {
    plugins: [react(), tailwindcss(), r2ApiPlugin()],
  };
});
