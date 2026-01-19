import crypto from "crypto";
import { env } from "@/lib/env";

export const hashIp = (ip: string) => {
  return crypto.createHmac("sha256", env.IP_HASH_SALT).update(ip).digest("hex");
};
