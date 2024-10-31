import { GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { memberType, memberTypeIdType } from './member-types.js';
import { userType } from './users.js';
import { UUIDType } from './uuid.js';
import { postType } from './posts.js';
import { profileType } from './profiles.js';
import { FastifyInstance } from 'fastify';

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
export const rootQueryType = new GraphQLObjectType<
  unknown,
  { db: FastifyInstance['prisma'] }
>({
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
      resolve: (_source, { id }, { db }) => db.memberType.findUnique({ where: { id } }),
    },
    users: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(userType))),
      resolve: (_source, _args, { db }) => db.user.findMany(),
    },
    user: {
      type: userType,
      args: {
        id: {
          type: new GraphQLNonNull(UUIDType),
        },
      },
      resolve: (_source, { id }, { db }) => db.user.findUnique({ where: { id } }),
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
      resolve: (_source, { id }, { db }) => db.post.findUnique({ where: { id } }),
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
      resolve: (_source, { id }, { db }) => db.profile.findUnique({ where: { id } }),
    },
  },
});
