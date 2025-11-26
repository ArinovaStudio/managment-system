import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function getUserId(req?: Request): Promise<string> {
  let token;
  
  // Try Authorization header first (for Postman/API testing)
  if (req) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  // Fallback to cookies (for browser requests)
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  }
  
  if (!token) throw new Error("Unauthorized");
  const user = verifyToken(token) as any;
  return user.userId || user.id;
}