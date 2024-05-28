import { cookies } from "next/headers";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
export const auth = {
  isAuthenticated,
  verifyToken,
  processToken,
};

function isAuthenticated() {
  try {
    verifyToken();
    return true;
  } catch {
    return false;
  }
}

function verifyToken() {
  const token = cookies().get("authorization")?.value ?? "";
  const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET!);
  const id = decoded.sub as string;
  return id;
}

function processToken(bearerToken: string | undefined): JwtPayload | null {
  if (bearerToken) {
    const token = bearerToken.split(" ")[1];
    const secret: Secret = process.env.NEXT_PUBLIC_JWT_SECRET as Secret;

    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      return decoded;
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  } else {
    console.log("Authorization token not found");
    return null;
  }
}
