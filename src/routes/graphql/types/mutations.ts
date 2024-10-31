import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { changeUserInputType, createUserInputType, userType } from './users.js';
import {
  changeProfileInputType,
  createProfileInputType,
  profileType,
} from './profiles.js';
import { changePostInputType, createPostInputType, postType } from './posts.js';
import { UUIDType } from './uuid.js';
import { FastifyInstance } from 'fastify';

/* 

type Mutations {
  createUser(dto: CreateUserInput!): User!
  createProfile(dto: CreateProfileInput!): Profile!
  createPost(dto: CreatePostInput!): Post!
  changePost(id: UUID!, dto: ChangePostInput!): Post!
  changeProfile(id: UUID!, dto: ChangeProfileInput!): Profile!
  changeUser(id: UUID!, dto: ChangeUserInput!): User!
  deleteUser(id: UUID!): String!
  deletePost(id: UUID!): String!
  deleteProfile(id: UUID!): String!
  subscribeTo(userId: UUID!, authorId: UUID!): String!
  unsubscribeFrom(userId: UUID!, authorId: UUID!): String!
}

*/

export const mutationsType = new GraphQLObjectType<
  unknown,
  { db: FastifyInstance['prisma'] }
>({
  name: 'Mutations',
  fields: {
    // user
    createUser: {
      args: {
        dto: { type: new GraphQLNonNull(createUserInputType) },
      },
      type: new GraphQLNonNull(userType),
      resolve: (_source, { dto }, { db }) => db.user.create({ data: dto }),
    },
    changeUser: {
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changeUserInputType) },
      },
      type: new GraphQLNonNull(userType),
      resolve: (_source, { id, dto }, { db }) =>
        db.user.update({ where: { id }, data: dto }),
    },
    deleteUser: {
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (_source, { id }, { db }) => {
        await db.user.delete({ where: { id } });
        return 'ok';
      },
    },

    // profile
    createProfile: {
      args: {
        dto: { type: new GraphQLNonNull(createProfileInputType) },
      },
      type: new GraphQLNonNull(profileType),
      resolve: (_source, { dto }, { db }) => db.profile.create({ data: dto }),
    },
    changeProfile: {
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changeProfileInputType) },
      },
      type: new GraphQLNonNull(profileType),
      resolve: (_source, { id, dto }, { db }) =>
        db.profile.update({ where: { id }, data: dto }),
    },
    deleteProfile: {
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (_source, { id }, { db }) => {
        await db.profile.delete({ where: { id } });
        return 'ok';
      },
    },

    // post
    createPost: {
      args: {
        dto: { type: new GraphQLNonNull(createPostInputType) },
      },
      type: new GraphQLNonNull(postType),
      resolve: (_source, { dto }, { db }) => db.post.create({ data: dto }),
    },
    changePost: {
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(changePostInputType) },
      },
      type: new GraphQLNonNull(postType),
      resolve: (_source, { id, dto }, { db }) =>
        db.post.update({ where: { id }, data: dto }),
    },
    deletePost: {
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (_source, { id }, { db }) => {
        await db.post.delete({ where: { id } });
        return 'ok';
      },
    },

    // subscription
    subscribeTo: {
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (_source, { userId, authorId }, { db }) => {
        await db.subscribersOnAuthors.create({
          data: {
            subscriberId: userId,
            authorId,
          },
        });
        return 'ok';
      },
    },
    unsubscribeFrom: {
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      type: new GraphQLNonNull(GraphQLString),
      resolve: async (_source, { userId, authorId }, { db }) => {
        await db.subscribersOnAuthors.delete({
          where: {
            subscriberId_authorId: {
              subscriberId: userId,
              authorId,
            },
          },
        });
        return 'ok';
      },
    },
  },
});
