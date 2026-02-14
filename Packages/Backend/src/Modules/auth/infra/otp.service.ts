import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { env } from "@core/config/env";

export class OtpService {
  public generateCode(codeLength: number): string {
    let otp = "";
    for (let index = 0; index < codeLength; index += 1) {
      otp += randomInt(0, 10).toString();
    }

    return otp;
  }

  public hashOtp(challengeId: string, otpCode: string): string {
    return createHmac("sha256", env.jwtAccessSecret)
      .update(`${challengeId}:${otpCode}`)
      .digest("hex");
  }

  public verifyOtp(challengeId: string, otpCode: string, expectedOtpHash: string): boolean {
    const currentHash = this.hashOtp(challengeId, otpCode);
    const expectedBuffer = Buffer.from(expectedOtpHash, "hex");
    const currentBuffer = Buffer.from(currentHash, "hex");

    if (expectedBuffer.length !== currentBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, currentBuffer);
  }
}
