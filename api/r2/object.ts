import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Busboy from "busboy";
import { getR2Bucket, getR2Client } from "../_r2";

export const config = {
  api: { bodyParser: false },
};

function sanitizeKey(name: string): string {
  return name.replace(/^\/+/, "").replace(/\.\.+/g, ".");
}

function joinKey(prefix: string, name: string): string {
  const p = prefix.replace(/\/+$/, "");
  const n = sanitizeKey(name);
  return p ? `${p}/${n}` : n;
}

function readJson(req: VercelRequest): Promise<unknown> {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") return upload(req, res);
  if (req.method === "DELETE") return remove(req, res);
  if (req.method === "GET") return sign(req, res);
  res.setHeader("Allow", "POST, DELETE, GET");
  return res.status(405).json({ error: "Method not allowed" });
}

async function upload(req: VercelRequest, res: VercelResponse) {
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
            const command = new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: body,
              ContentType: mimeType || "application/octet-stream",
            });
            await client.send(command);
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

    return res.status(200).json({ uploaded });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("r2 upload error", err);
    return res.status(500).json({ error: message });
  }
}

interface DeleteBody {
  key?: string;
  keys?: string[];
}

async function remove(req: VercelRequest, res: VercelResponse) {
  try {
    const client = getR2Client();
    const bucket = getR2Bucket();

    const body = (await readJson(req)) as DeleteBody;
    const keys: string[] = Array.isArray(body.keys)
      ? body.keys
      : body.key
      ? [body.key]
      : [];

    if (keys.length === 0) {
      return res.status(400).json({ error: "Provide { key } or { keys: [...] } in body" });
    }

    const safe = keys.map((k) => sanitizeKey(String(k)));

    if (safe.length === 1) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: safe[0] }));
    } else {
      await client.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: { Objects: safe.map((Key) => ({ Key })) },
        })
      );
    }

    return res.status(200).json({ deleted: safe });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    console.error("r2 delete error", err);
    return res.status(500).json({ error: message });
  }
}

// Optional: short-lived presigned download URL for private buckets.
// GET /api/r2/object?key=path/to/file.pdf  ->  { url }
async function sign(req: VercelRequest, res: VercelResponse) {
  try {
    const client = getR2Client();
    const bucket = getR2Bucket();
    const key = typeof req.query.key === "string" ? sanitizeKey(req.query.key) : "";
    if (!key) return res.status(400).json({ error: "Missing ?key=" });

    const url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 3600 }
    );
    return res.status(200).json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign failed";
    console.error("r2 sign error", err);
    return res.status(500).json({ error: message });
  }
}
