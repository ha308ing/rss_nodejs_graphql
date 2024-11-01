import type { FastifyInstance } from 'fastify';
import DataLoader, { type BatchLoadFn } from 'dataloader';
import type { MemberType, Post, Profile, User } from '@prisma/client';

export const createLoaders = (db: FastifyInstance['prisma']) => ({
  users: new DataLoader(userLoader(db)),
  profiles: new DataLoader(profileLoader(db)),
  profileByUserId: new DataLoader(profileByUserIdLoader(db)),
  memberTypes: new DataLoader(memberTypeLoader(db)),
  posts: new DataLoader(postLoader(db)),
  postsByUserId: new DataLoader(postsByUserIdLoader(db)),
  authors: new DataLoader(authorsLoader(db)),
  subscribers: new DataLoader(subscribersLoader(db)),
});

type FnLoader<T = unknown> = (
  db: FastifyInstance['prisma'],
) => BatchLoadFn<string, T | undefined>;

const userLoader: FnLoader<User> = (db) => async (keys) => {
  const users = await db.user.findMany();

  const res = keys.map((key) => users.find(({ id }) => id == key));

  return res;
};

const profileLoader: FnLoader<Profile> = (db) => async (keys) => {
  const profiles = await db.profile.findMany();

  const res = keys.map((key) => profiles.find(({ id }) => id == key));

  return res;
};

const profileByUserIdLoader: FnLoader<Profile> = (db) => async (keys) => {
  const profiles = await db.profile.findMany();

  const res = keys.map((key) => profiles.find(({ userId }) => userId == key));

  return res;
};

const memberTypeLoader: FnLoader<MemberType> = (db) => async (keys) => {
  const users = await db.memberType.findMany();

  const res = keys.map((key) => users.find(({ id }) => id == key));

  return res;
};

const postLoader: FnLoader<Post> = (db) => async (keys) => {
  const posts = await db.post.findMany();

  const res = keys.map((key) => posts.find(({ id }) => id == key));

  return res;
};

const postsByUserIdLoader: FnLoader<Post[]> = (db) => async (keys) => {
  const posts = await db.post.findMany();

  const postsByAuthor = posts.reduce((acc: Record<string, Post[]>, post) => {
    const authorId = post.authorId,
      postId = post.id;

    if (acc[authorId] == undefined) {
      acc[authorId] = [];
      if (postId) acc[authorId].push(post);
    } else {
      if (postId) acc[authorId].push(post);
    }
    return acc;
  }, {});

  const res = keys.map((key) => postsByAuthor[key] || []);

  return res;
};

const authorsLoader: FnLoader<string[]> = (db) => async (keys) => {
  const subscribers = await db.subscribersOnAuthors.findMany();

  const authorsBySubscriberId = subscribers.reduce(
    (acc: Record<string, string[]>, sub) => {
      const subId = sub.subscriberId,
        authId = sub.authorId;

      if (acc[subId] == undefined) {
        acc[subId] = [];
        if (authId) acc[subId].push(authId);
      } else {
        if (authId) acc[subId].push(authId);
      }
      return acc;
    },
    {},
  );

  const res = keys.map((key) => authorsBySubscriberId[key] || []);

  return res;
};

export const subscribersLoader: FnLoader<string[]> = (db) => async (keys) => {
  const subscribers = await db.subscribersOnAuthors.findMany();

  const subObj = subscribers.reduce((acc: Record<string, string[]>, sub) => {
    const subId = sub.subscriberId,
      authId = sub.authorId;

    if (acc[authId] == undefined) {
      acc[authId] = [];
      if (subId) acc[authId].push(subId);
    } else {
      if (subId) acc[authId].push(subId);
    }
    return acc;
  }, {});

  const res = keys.map((key) => subObj[key] || []);

  return res;
};
