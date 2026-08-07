import type { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { authOptions } from "../../../lib/auth";

export { authOptions };
export default NextAuth(authOptions);
