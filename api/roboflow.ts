import type { VercelRequest, VercelResponse } from "@vercel/node";

const ROBOFLOW_MODEL_ID =
  process.env.ROBOFLOW_MODEL_ID || "pine-disease-classification-qmgil/1";

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    if (!ROBOFLOW_API_KEY) {
      return res.status(500).json({
        error: "ROBOFLOW_API_KEY 서버 환경변수가 없습니다.",
      });
    }

    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        error: "imageUrl이 없습니다.",
      });
    }

    // 1. Supabase Storage 이미지 다운로드
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return res.status(400).json({
        error: "이미지 URL을 서버에서 불러올 수 없습니다.",
        status: imageResponse.status,
      });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const base64Image = imageBuffer.toString("base64");

    // 2. Roboflow 호출
    const roboflowResponse = await fetch(
      `https://serverless.roboflow.com/${ROBOFLOW_MODEL_ID}?api_key=${ROBOFLOW_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: base64Image,
      }
    );

    const text = await roboflowResponse.text();

    if (!roboflowResponse.ok) {
      return res.status(roboflowResponse.status).json({
        error: "Roboflow 분석 실패",
        detail: text,
      });
    }

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
}