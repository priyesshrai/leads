import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_RESET_SECRET!;

export function generateResetJwt(userId: string) {
    return jwt.sign(
        { userId },
        SECRET,
        { expiresIn: "15m" }
    );
}

export function verifyResetJwt(token: string) {
    try {
        return jwt.verify(token, SECRET) as { userId: string };
    } catch (e) {
        return null;
    }
}
