import jwt from "jsonwebtoken";

export const createToken = (payload: any) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};

  export function deleteTokenCookie() {
  return `token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}