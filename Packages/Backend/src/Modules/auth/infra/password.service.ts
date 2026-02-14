import bcrypt from "bcrypt";

import { env } from "@core/config/env";

export class PasswordService {
  public async hash(password: string): Promise<string> {
    if (env.authPasswordHashAlgorithm !== "bcrypt") {
      throw new Error(
        `Unsupported AUTH_PASSWORD_HASH_ALGORITHM="${env.authPasswordHashAlgorithm}". Only "bcrypt" is available.`,
      );
    }

    return bcrypt.hash(password, env.authPasswordHashRounds);
  }

  public async verify(password: string, passwordHash: string): Promise<boolean> {
    if (env.authPasswordHashAlgorithm !== "bcrypt") {
      throw new Error(
        `Unsupported AUTH_PASSWORD_HASH_ALGORITHM="${env.authPasswordHashAlgorithm}". Only "bcrypt" is available.`,
      );
    }

    return bcrypt.compare(password, passwordHash);
  }
}
