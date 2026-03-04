import { SignJWT, jwtVerify } from "jose";

interface AuthJwtPayload {
  workspaceId: string;
  email: string;
  metadata?: Record<string, unknown>;
}

interface VerifiedPayload extends AuthJwtPayload {
  iat: number;
  exp: number;
}

function getSecret(): Uint8Array {
  const secret = process.env.MAGICLINKKIT_JWT_SECRET;
  if (!secret) {
    throw new Error("MAGICLINKKIT_JWT_SECRET environment variable is not set");
  }
  if (secret.length < 32) {
    throw new Error(
      "MAGICLINKKIT_JWT_SECRET must be at least 32 characters for HS256 security"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthJwt(payload: AuthJwtPayload): Promise<string> {
  return new SignJWT({
    workspaceId: payload.workspaceId,
    email: payload.email,
    metadata: payload.metadata,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret());
}

export async function verifyAuthJwt(token: string): Promise<VerifiedPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    workspaceId: payload.workspaceId as string,
    email: payload.email as string,
    metadata: payload.metadata as Record<string, unknown> | undefined,
    iat: payload.iat as number,
    exp: payload.exp as number,
  };
}
