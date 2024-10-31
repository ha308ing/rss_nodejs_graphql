import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import { postType } from './posts.js';
import { profileType } from './profiles.js';
import { UUIDType } from './uuid.js';
import { FastifyInstance } from 'fastify';

/* 

type User {
  id: UUID!
  name: String!
  balance: Float!
  profile: Profile
  posts: [Post!]!
  userSubscribedTo: [User!]!
  subscribedToUser: [User!]!
}

*/

export const userType = new GraphQLObjectType<
  { id: string },
  { db: FastifyInstance['prisma'] }
>({
  name: 'user',
  fields: function () {
    return {
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      profile: {
        type: profileType,
        resolve: ({ id }, _args, { db }) =>
          db.profile.findUnique({ where: { userId: id } }),
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType))),
        resolve: ({ id }, _args, { db }) => db.post.findMany({ where: { authorId: id } }),
      },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
        resolve: ({ id }, _args, { db }) =>
          db.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: id,
                },
              },
            },
          }),
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
        resolve: ({ id }, _args, { db }) =>
          db.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: id,
                },
              },
            },
          }),
      },
    };
  },
});

/* 


input ChangeUserInput {
  name: String
  balance: Float
}


*/

export const changeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});

/* 

input CreateUserInput {
  name: String!
  balance: Float!
}

*/

export const createUserInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  },
});
