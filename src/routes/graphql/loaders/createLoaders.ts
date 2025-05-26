import type { FastifyInstance } from 'fastify';
import DataLoader, { type BatchLoadFn } from 'dataloader';
import type { MemberType, Post, Profile, User } from '@prisma/client';
import type { UserExtended } from '../types/users.js';

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

const userLoader: FnLoader<Partial<UserExtended>> = (db) => async (keys) => {
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

const authorsLoader: FnLoader<User[]> = (db) => async (keys) => {
  const subscribers = await db.subscribersOnAuthors.findMany({
    include: {
      author: true,
    },
  });

  const authorsBySubscriberId = subscribers.reduce((acc: Record<string, User[]>, sub) => {
    const subId = sub.subscriberId,
      author = sub.author;

    if (acc[subId] == undefined) {
      acc[subId] = [];
      if (author) acc[subId].push(author);
    } else {
      if (author) acc[subId].push(author);
    }
    return acc;
  }, {});

  const res = keys.map((key) => authorsBySubscriberId[key] || []);

  return res;
};

export const subscribersLoader: FnLoader<User[]> = (db) => async (keys) => {
  const subscribers = await db.subscribersOnAuthors.findMany({
    include: {
      subscriber: true,
    },
  });

  const subObj = subscribers.reduce((acc: Record<string, User[]>, sub) => {
    const subscriber = sub.subscriber,
      authId = sub.authorId;

    if (acc[authId] == undefined) {
      acc[authId] = [];
      if (subscriber) acc[authId].push(subscriber);
    } else {
      if (subscriber) acc[authId].push(subscriber);
    }
    return acc;
  }, {});

  const res = keys.map((key) => subObj[key] || []);

  return res;
};
