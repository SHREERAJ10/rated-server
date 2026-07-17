import { prisma } from "../../db.js";

export const activateUser = async (
  id: string,
  username: string,
  displayName: string,
  bio: string,
  pfpUrl: string,
) => {
  const user = await prisma.user.create({
    data: {
      id: id,
      username: username,
      displayName: displayName,
      pfpUrl: pfpUrl,
      bio: bio,
    },
  });
  return user;
};

export const getUser = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username: username,
    },
  });
  return user;
};

export const getOnboardingStatus = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
};