import type { NextApiRequest, NextApiResponse } from "next";

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const VOTE_CONTRACT =
  process.env.NEXT_PUBLIC_VOTE_ADDR ??
  "0xe8A858B29311652F7e2170118FbEaD34d097e88A";
const FROM_BLOCK = "35340816";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!POLYGONSCAN_API_KEY) {
    return res
      .status(500)
      .json({ error: "POLYGONSCAN_API_KEY not configured" });
  }

  try {
    const url =
      `https://api.polygonscan.com/api` +
      `?module=logs&action=getLogs` +
      `&fromBlock=${FROM_BLOCK}&toBlock=latest` +
      `&address=${VOTE_CONTRACT}` +
      `&apikey=${POLYGONSCAN_API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Polygonscan returned ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message ?? "Failed to fetch factions data" });
  }
}
