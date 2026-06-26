import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hash: string }> }
) {
  try {
    const { hash } = await params;
    const cleanHash = hash.replace(/^0x/, "").toLowerCase();

    const proof = await prisma.proof.findUnique({
      where: { hash: cleanHash },
    });

    if (!proof) {
      return NextResponse.json({ error: "Proof not found in indexing database" }, { status: 404 });
    }

    return NextResponse.json(proof);
  } catch (error) {
    console.error("GET /api/proofs/[hash] error:", error);
    return NextResponse.json({ error: "Failed to fetch proof" }, { status: 500 });
  }
}
