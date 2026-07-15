"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

// Every submission from the whole class writes to the SAME file — that's
// the entire demo. `harry.txt` lives at the project root, not inside
// app/, precisely so it's obviously "server disk," not "app asset."
const LOG_PATH = path.join(process.cwd(), "harry.txt");

const MAX_NAME_LENGTH = 80;
const MAX_ADDRESS_LENGTH = 120;

/**
 * The Server Action.
 *
 * Signature matches React's `useActionState(action, initialState)`:
 * the action receives the *previous* state as its first argument and the
 * submitted `FormData` as its second — not an event, a FormData instance
 * React builds from the <form> automatically.
 *
 * Bound directly to `<form action={...}>` (via useActionState's returned
 * `formAction`), this keeps working with JavaScript disabled: the browser
 * performs a real POST, Next.js runs this function on the server, and the
 * page re-renders with the new state. No API route was written to make
 * that happen.
 */
export async function submitEntry(prevState, formData) {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();

  // Server actions are network endpoints under the hood — validate here,
  // never trust the client's HTML `required` attribute alone.
  const errors = {};
  if (!name) errors.name = "Name is required.";
  else if (name.length > MAX_NAME_LENGTH)
    errors.name = `Keep it under ${MAX_NAME_LENGTH} characters.`;

  if (!address) errors.address = "Address is required.";
  else if (address.length > MAX_ADDRESS_LENGTH)
    errors.address = `Keep it under ${MAX_ADDRESS_LENGTH} characters.`;

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Fix the highlighted fields — nothing was written to disk.",
      errors,
      values: { name, address },
      entry: null,
      fileContents: prevState.fileContents,
      submissionCount: prevState.submissionCount,
    };
  }

  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] Name: ${name} — Address: ${address}\n`;

  // The whole point of the lecture: real Node.js fs access, unreachable
  // from any browser. Appending (not overwriting) turns harry.txt into a
  // running log of every submission this server has ever received.
  await fs.appendFile(LOG_PATH, line, "utf8");
  const fileContents = await fs.readFile(LOG_PATH, "utf8");

  // Tell Next.js the data backing "/" changed, so a full navigation
  // (e.g. the no-JS fallback path) re-renders the Server Component with
  // the fresh file contents instead of a stale cache.
  revalidatePath("/");

  return {
    status: "success",
    message: `Saved. fs.appendFile wrote ${line.length} bytes to harry.txt on the server.`,
    errors: {},
    values: { name: "", address: "" },
    entry: { name, address, timestamp },
    fileContents,
    submissionCount: prevState.submissionCount + 1,
  };
}
