import { NextResponse } from "next/server";

/**
 * GET /api/add
 *
 * Route handlers don't need to expose every HTTP method — but when a
 * "GET" is left unexported, Next.js auto-replies 405 to anyone who visits
 * the URL in a browser. Here we export GET too, so visiting the endpoint
 * directly returns useful, human-readable docs instead of a bare error.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/add",
    method: "POST",
    body: { a: "number", b: "number" },
    example: { a: 2, b: 3 },
    responses: {
      200: { success: true, result: 5, a: 2, b: 3 },
      400: { success: false, error: "a and b must both be finite numbers" },
    },
  });
}

/**
 * POST /api/add
 *
 * Reads { a, b } from the JSON body, validates both are finite numbers,
 * and returns their sum. Bad input (missing fields, non-numeric values,
 * malformed JSON) gets a 400 with an explanatory error message instead
 * of crashing or silently returning NaN.
 */
export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { a, b } = body ?? {};
  const isFiniteNumber = (n) => typeof n === "number" && Number.isFinite(n);

  if (!isFiniteNumber(a) || !isFiniteNumber(b)) {
    return NextResponse.json(
      {
        success: false,
        error: "Both 'a' and 'b' are required and must be finite numbers.",
      },
      { status: 400 }
    );
  }

  const result = a + b;

  return NextResponse.json({ success: true, result, a, b }, { status: 200 });
}
