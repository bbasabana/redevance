import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

/**
 * Generates a new TOTP secret for a user.
 */
export function generateTwoFactorSecret() {
    return generateSecret();
}

/**
 * Generates a TOTP URI for QR code generation.
 * @param email The user's email
 * @param secret The user's TOTP secret
 */
export function getTwoFactorURI(email: string, secret: string) {
    return generateURI({ label: email, issuer: "RTNC Redevance", secret });
}

/**
 * Generates a Data URL for the QR code image.
 */
export async function generateQRCodeDataURL(otpauthURI: string) {
    try {
        return await QRCode.toDataURL(otpauthURI);
    } catch (err) {
        console.error("Failed to generate QR code", err);
        throw new Error("QR_CODE_GENERATION_FAILED");
    }
}

/**
 * Verifies a TOTP code against a secret.
 */
export function verifyTwoFactorCode(token: string, secret: string) {
    return verifySync({ token, secret }).valid;
}

/**
 * Generates 10 recovery codes.
 * Returns an array of plane text codes and an array of hashed codes to store in DB.
 */
export function generateRecoveryCodes() {
    const plainCodes = Array.from({ length: 10 }, () =>
        Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    const hashedCodes = plainCodes.map(code => bcrypt.hashSync(code, 10));

    return { plainCodes, hashedCodes };
}

/**
 * Verifies a recovery code against the stored hashes.
 */
export function verifyRecoveryCode(code: string, hashedCodes: string[]) {
    for (const hash of hashedCodes) {
        if (bcrypt.compareSync(code, hash)) {
            return true;
        }
    }
    return false;
}
