import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { base64, mimeType } = await request.json();

    if (!base64 || !mimeType) {
      return NextResponse.json({ error: "Missing base64 or mimeType" }, { status: 400 });
    }

    const bytes = Buffer.from(base64.replace(/^data:.*;base64,/, ""), "base64");
    const extension = mimeType.split("/")[1] || "jpg";
    const filename = `image-${Date.now()}.${extension}`;
    const url = `https://q2n566yswquyfc6j.public.blob.vercel-storage.com/${filename}`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN not configured");
    }

    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
        Authorization: `Bearer ${token}`,
      },
      body: bytes,
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Blob upload failed ${resp.status}: ${text}`);
    }

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed" },
      { status: 500 }
    );
  }
}
