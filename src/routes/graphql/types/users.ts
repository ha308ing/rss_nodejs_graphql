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
import type { TContext } from '../index.js';
import type { Prisma } from '@prisma/client';

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

export type UserExtended = Prisma.UserGetPayload<{
  include: {
    userSubscribedTo: true;
    subscribedToUser: true;
  };
}> & {
  subscribers?: UserExtended[];
  authors?: UserExtended[];
};

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
          if (!userSubscribedTo) {
            return loaders.authors.load(id);
          }

          const user = await loaders.users.load(id);

          return user?.authors ?? [];
        },
      },
      subscribedToUser: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
        resolve: async ({ id, subscribedToUser }, _args, { loaders }) => {
          if (!subscribedToUser) {
            return loaders.subscribers.load(id);
          }

          const user = await loaders.users.load(id);

          return user?.subscribers ?? [];
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
