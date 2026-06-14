import { clerkClient, getAuth } from "@clerk/express";
import prisma from "./connectDb.js";

/**
 * Resolves the Clerk auth on the request and returns the matching DB user.
 * If the user doesn't exist yet (e.g. local dev without Clerk webhooks),
 * it is provisioned on-demand from Clerk.
 *
 * Returns null when the request is unauthenticated.
 */
export const getCurrentUser = async (req) => {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkUserId } });
  if (existing) return existing;

  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? null;
  const username =
    clerkUser.username ||
    email?.split("@")[0] ||
    `user_${clerkUserId.slice(-6)}`;

  return prisma.user.upsert({
    where: { clerkUserId },
    update: {},
    create: {
      clerkUserId,
      username,
      email: email ?? `${clerkUserId}@placeholder.local`,
      img: clerkUser.imageUrl ?? null,
    },
  });
};
