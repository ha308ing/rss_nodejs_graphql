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
import { TContext } from '../index.js';
import { Prisma } from '@prisma/client';

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

type UserExtended = Prisma.UserGetPayload<{
  include: {
    userSubscribedTo: { include: { author: true } };
    subscribedToUser: { include: { subscriber: true } };
  };
}>;

export const userType = new GraphQLObjectType<UserExtended, TContext>({
  name: 'user',
  fields: function () {
    return {
      id: { type: new GraphQLNonNull(UUIDType) },
      name: { type: new GraphQLNonNull(GraphQLString) },
      balance: { type: new GraphQLNonNull(GraphQLFloat) },
      profile: {
        type: profileType,
        resolve: ({ id }, _args, { loaders }) => loaders.profileByUserId.load(id),
      },
      posts: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType))),
        resolve: async ({ id }, _args, { loaders }) => loaders.postsByUserId.load(id),
      },
      userSubscribedTo: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
        resolve: async ({ id, userSubscribedTo }, _args, { loaders }) => {
          if (userSubscribedTo) {
            const authors = userSubscribedTo.map((o) => o.author);

            return authors;
          } else {
            const authorsIds = (await loaders.authors.load(id)) ?? [];

            return loaders.users.loadMany(authorsIds);
          }
        },
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
        resolve: async ({ id, subscribedToUser }, _args, { loaders }) => {
          if (subscribedToUser) {
            const subs = subscribedToUser.map((o) => o.subscriber);

            return subs;
          } else {
            const subsIds = (await loaders.subscribers.load(id)) ?? [];

            return loaders.users.loadMany(subsIds);
          }
        },
      },
    };
  },
}) as GraphQLObjectType<UserExtended>;

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
