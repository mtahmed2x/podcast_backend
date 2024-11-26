import jwt from "jsonwebtoken";

export const generateToken = (secret: string, id: string): string => {
  const token = jwt.sign(secret, id);
  return token;
};
type Decoded = {
  id: string;
};
export const verifyToken = (secret: string, token: string) => {
  jwt.verify(token, process.env.JWT_SECRET!, (error, decoded) => {
    (decoded as Decoded) ? decoded : error;
  });
};
