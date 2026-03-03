#!/usr/bin/env ts-node
// Script to seed the mixes endpoint.  Written in TypeScript so linting
// passes without `require` complaints.

import "dotenv/config";

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  const apiKey = process.env.NEXT_PUBLIC_API_SECRET_KEY;

  if (!apiKey) {
    console.error(
      "Environment variable NEXT_PUBLIC_API_SECRET_KEY is required",
    );
    process.exit(1);
  }

  const url = `${baseUrl}/api/populate`;
  console.log(`POST ${url}`);

  try {
    // Node 18+ includes fetch globally.  If for some reason it's not
    // available we bail; importing node-fetch introduces type dependency
    // issues and is unnecessary for our purposes.
    if (typeof globalThis.fetch !== "function") {
      throw new Error(
        "global fetch is not available; please run on Node 18+ or install a fetch polyfill",
      );
    }
    const fetchFn = globalThis.fetch.bind(globalThis) as typeof fetch;

    const res = await fetchFn(url, {
      method: "POST",
      headers: { "x-api-key": apiKey },
    });

    const text = await res.text();
    console.log("status", res.status);
    console.log("body", text);
  } catch (err) {
    console.error("Failed to call populate endpoint", err);
    process.exit(1);
  }
}

main();
