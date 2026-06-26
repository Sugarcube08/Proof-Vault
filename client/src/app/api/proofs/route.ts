import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get("wallet");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const skip = (page - 1) * limit;

    const where: {
      wallet?: string;
      hash?: { contains: string; mode: "insensitive" };
    } = {};
    if (wallet) {
      where.wallet = wallet;
    }
    if (search) {
      where.hash = { contains: search, mode: "insensitive" };
    }

    const [proofs, total] = await Promise.all([
      prisma.proof.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.proof.count({ where }),
    ]);

    return NextResponse.json({
      proofs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/proofs error:", error);
    return NextResponse.json({ error: "Failed to fetch proofs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wallet, hash } = body;

    if (!wallet || !hash) {
      return NextResponse.json({ error: "Wallet and hash are required" }, { status: 400 });
    }

    const cleanHash = hash.replace(/^0x/, "").toLowerCase();

    // Check if duplicate hash exists in database
    const existing = await prisma.proof.findUnique({
      where: { hash: cleanHash },
    });

    if (existing) {
      return NextResponse.json({ error: "Proof already registered" }, { status: 400 });
    }

    const proof = await prisma.proof.create({
      data: {
        wallet,
        hash: cleanHash,
      },
    });

    return NextResponse.json(proof, { status: 201 });
  } catch (error) {
    console.error("POST /api/proofs error:", error);
    return NextResponse.json({ error: "Failed to register proof" }, { status: 500 });
  }
}
