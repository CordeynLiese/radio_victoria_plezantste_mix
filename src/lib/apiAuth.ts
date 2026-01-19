import { NextRequest } from "next/server";

export const isAuthorized = (req: NextRequest): boolean => {
  const apiKey = req.headers.get("x-api-key");
  return apiKey === process.env.NEXT_PUBLIC_API_SECRET_KEY;
};
