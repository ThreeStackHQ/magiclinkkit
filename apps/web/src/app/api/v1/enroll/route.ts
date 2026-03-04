export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { withApiKey } from "@/lib/api-key";
import { twofaEnrollments } from "@twofakit/db";
import { encrypt } from "@twofakit/db";
import { and, eq } from "drizzle-orm";

const EnrollSchema = z.object({
  userId: z.string().min(1).max(255),
});

async function handler(
  req: NextRequest,
  ctx: { workspaceId: string }
): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const result = EnrollSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { status: "fail", message: "userId is required" },
        { status: 422 }
      );
    }

    const { userId } = result.data;
    const encryptionKey = process.env.TWOFAKIT_ENCRYPTION_KEY;
    if (!encryptionKey) {
      return NextResponse.json(
        { status: "fail", message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check if already enrolled and enabled
    const [existing] = await db
      .select()
      .from(twofaEnrollments)
      .where(
        and(
          eq(twofaEnrollments.workspaceId, ctx.workspaceId),
          eq(twofaEnrollments.endUserId, userId),
          eq(twofaEnrollments.isEnabled, true)
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { status: "fail", message: "User already has 2FA enabled" },
        { status: 409 }
      );
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `TwoFAKit:${userId}`,
      issuer: "TwoFAKit",
    });

    // Encrypt the secret
    const encryptedData = encrypt(secret.base32, encryptionKey);
    const secretEncrypted = JSON.stringify(encryptedData);

    // Delete any pending (not enabled) enrollment for this user
    await db
      .delete(twofaEnrollments)
      .where(
        and(
          eq(twofaEnrollments.workspaceId, ctx.workspaceId),
          eq(twofaEnrollments.endUserId, userId),
          eq(twofaEnrollments.isEnabled, false)
        )
      );

    // Create enrollment (not yet enabled)
    const [enrollment] = await db
      .insert(twofaEnrollments)
      .values({
        workspaceId: ctx.workspaceId,
        endUserId: userId,
        secretEncrypted,
        isEnabled: false,
      })
      .returning({ id: twofaEnrollments.id });

    if (!enrollment) {
      return NextResponse.json(
        { status: "fail", message: "Failed to create enrollment" },
        { status: 500 }
      );
    }

    // Generate QR code
    const otpauthUrl = secret.otpauth_url;
    const qrCode = otpauthUrl
      ? await QRCode.toDataURL(otpauthUrl)
      : undefined;

    return NextResponse.json(
      {
        status: "success",
        data: {
          enrollmentId: enrollment.id,
          qrCode,
          secret: secret.base32,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Enroll error:", error);
    return NextResponse.json(
      { status: "fail", message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return withApiKey(req, handler);
}
