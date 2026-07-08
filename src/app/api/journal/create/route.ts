import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/api";

const journalSchema = z
  .object({
    profileId: z.string().min(1),
    entryType: z.enum(["reflection", "decision", "timing_check", "freeform"]),
    encryptionMode: z.enum(["private", "session_analysis", "standard"]),
    encryptedBody: z.string().optional(),
    plaintextBody: z.string().optional(),
    semanticTags: z.array(z.string()).default([]),
    aiAnalysisAllowed: z.boolean().default(false)
  })
  .superRefine((value, ctx) => {
    if (value.encryptionMode === "private" && value.plaintextBody) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Private journal mode cannot include plaintextBody.",
        path: ["plaintextBody"]
      });
    }
    if (value.aiAnalysisAllowed && value.encryptionMode === "private") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Server AI analysis is not compatible with private encrypted journal mode.",
        path: ["aiAnalysisAllowed"]
      });
    }
  });

export async function POST(request: Request) {
  try {
    const entry = journalSchema.parse(await request.json());
    return NextResponse.json(
      {
        id: "local-journal-entry-demo",
        ...entry,
        createdAt: new Date().toISOString()
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
