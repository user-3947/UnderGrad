import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ListObjectsV2Command, CommonPrefix } from "@aws-sdk/client-s3";
import { getR2Bucket, getR2Client } from "../_r2.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawPrefix = typeof req.query.prefix === "string" ? req.query.prefix : "";
  const delimiter = "/";
  const continuationToken = typeof req.query.continuationToken === "string" ? req.query.continuationToken : undefined;

  try {
    const client = getR2Client();
    const bucket = getR2Bucket();

    const normalizedPrefix = rawPrefix ? (rawPrefix.endsWith("/") ? rawPrefix : `${rawPrefix}/`) : "";

    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: normalizedPrefix,
        Delimiter: delimiter,
        MaxKeys: 1000,
        ContinuationToken: continuationToken,
      }),
    );

    const folders = (result.CommonPrefixes ?? [])
      .map((p: CommonPrefix) => p.Prefix)
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

    return res.status(200).json({
      folders,
      files,
      nextContinuationToken: result.NextContinuationToken ?? null,
      isTruncated: Boolean(result.IsTruncated),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "List failed";
    console.error("r2 list error", err);
    return res.status(500).json({ error: message });
  }
}
