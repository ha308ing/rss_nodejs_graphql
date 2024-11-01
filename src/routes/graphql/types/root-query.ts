import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { memberType, memberTypeIdType } from './member-types.js';
import { userType } from './users.js';
import { UUIDType } from './uuid.js';
import { postType } from './posts.js';
import { profileType } from './profiles.js';
import { TContext } from '../index.js';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

/* 

type RootQueryType {
  memberTypes: [MemberType!]!
  memberType(id: MemberTypeId!): MemberType
  users: [User!]!
  user(id: UUID!): User
  posts: [Post!]!
  post(id: UUID!): Post
  profiles: [Profile!]!
  profile(id: UUID!): Profile
}

*/

export const rootQueryType = new GraphQLObjectType<unknown, TContext>({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(memberType))),
      resolve: (_source, _args, { db }) => db.memberType.findMany(),
    },
    memberType: {
      type: memberType,
      args: {
        id: { type: new GraphQLNonNull(memberTypeIdType) },
      },
      resolve: (_source, { id }: { id: string }, { loaders }) =>
        loaders.memberTypes.load(id),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
      resolve: async (_source, _args, { db, loaders }, info) => {
        const parsedInfo = parseResolveInfo(info);
        const { fields } = simplifyParsedResolveInfoFragmentWithType(
          parsedInfo as ResolveTree,
          userType,
        );

        const entries = Object.keys(fields);

        const isUserSubInclude = entries.includes('userSubscribedTo');
        const isSubToUserInclude = entries.includes('subscribedToUser');

        const isExtended = isSubToUserInclude || isUserSubInclude;

        const users = await db.user.findMany({
          include: {
            subscribedToUser: isSubToUserInclude && {
              include: {
                subscriber: true,
              },
            },
            userSubscribedTo: isUserSubInclude && {
              include: {
                author: true,
              },
            },
          },
        });

        if (isExtended) {
          users.forEach((user) => loaders.users.prime(user.id, user));
        }

        return users;
      },
    },
    user: {
      type: userType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: (_source, { id }: { id: string }, { loaders }) => loaders.users.load(id),
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(postType))),
      resolve: async (_source, _args, { db }) => (await db.post.findMany()) ?? [],
    },
    post: {
      type: postType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: (_source, { id }: { id: string }, { loaders }) => loaders.posts.load(id),
    },
    profiles: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(profileType))),
      resolve: (_source, _args, { db }) => db.profile.findMany(),
    },
    greet: {
      type: GraphQLString,
      args: {
        name: {
          type: GraphQLString,
        },
      },
      resolve: (_, { name }) => `Hello! ${name}!`,
    },
    profile: {
      type: profileType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: (_source, { id }: { id: string }, { loaders }) =>
        loaders.profiles.load(id),
    },
  },
});
