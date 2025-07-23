import { PrismaClient } from "@/generated/prisma";
import { NextRequest, NextResponse } from "next/server";
import { resolveMx } from "node:dns/promises";

const prisma = new PrismaClient();

async function domainHasMx(domain: string) {
  try {
    const mx = await resolveMx(domain);
    return mx.length > 0;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (
      !email ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const domain = email.split("@")[1];
    if (!(await domainHasMx(domain))) {
      return NextResponse.json(
        { error: "Email domain does not accept mail" },
        { status: 400 }
      );
    }

    const existing = await prisma.waitlist.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const newEntry = await prisma.waitlist.create({ data: { email } });
    return NextResponse.json(newEntry, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
