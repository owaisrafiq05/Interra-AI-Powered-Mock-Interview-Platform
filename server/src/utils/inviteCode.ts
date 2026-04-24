import crypto from "crypto";
import { Interview } from "../models/interview.model";

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
      code += ALPHANUM[bytes[i] % ALPHANUM.length];
    }
    const exists = await Interview.exists({ inviteCode: code });
    if (!exists) return code;
  }
  throw new Error("Could not allocate invite code");
}
