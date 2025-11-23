import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import ms, { StringValue } from "ms";

type TokensMap = Map<
  string,
  { expAt: number; revockedAt?: number | null; type: string }
>;

type CreatedTokensMap = Map<
  string,
  { token: string; expAt: number; jti: string }
>;

type createTokenParams = {
  userId?: string;
  role?: string;
  type: string;
  expiresIn?: StringValue;
};

const clearOldTokens = (tokensMap: TokensMap) => {
  const toRemove: string[] = [];
  const now = Date.now();
  const keepDate = now - 3 * 24 * 60 * 60 * 1000;
  tokensMap.forEach((token, jti) => {
    if (token.revockedAt && token.revockedAt < keepDate) {
      toRemove.push(jti);
    } else if (token.expAt >= now) {
      token.revockedAt = now;
    }
  });
  toRemove.forEach((key) => {
    tokensMap.delete(key);
  });
  return tokensMap;
};

export default class TokenManager {
  tokensMap: TokensMap = new Map();
  valid: boolean;
  sub: string | null;
  createdTokens: CreatedTokensMap = new Map();
  constructor({ tokensMap }: { tokensMap?: TokensMap }) {
    this.sub = null;
    this.createdTokens = new Map();
    this.valid = false;
    if (tokensMap) {
      this.tokensMap = clearOldTokens(tokensMap);
    } else {
      throw new Error("TokenManager constructor requires token or tokensMap");
    }
  }
  createToken({ userId, role, type, expiresIn }: createTokenParams) {
    if (this.sub) {
      if (userId && this.sub !== userId) {
        throw new Error("different subject");
      }
    } else {
      if (!userId) {
        throw new Error("undefined subject");
      }
      this.sub = userId;
    }
    const expAt = expiresIn ? ms(expiresIn) + Date.now() : -1;
    const jti = randomUUID();
    const token = jwt.sign(
      {
        jti,
        sub: this.sub,
        role,
        typ: type,
      },
      process.env.TOKEN_PASSWORD as string,
      expiresIn ? { expiresIn } : {}
    );
    this.createdTokens.set(type, { token, expAt, jti });
    this.tokensMap.set(jti, { type, expAt, revockedAt: null });
  }
  getByType(type: string) {
    return this.createdTokens.get(type);
  }
}
