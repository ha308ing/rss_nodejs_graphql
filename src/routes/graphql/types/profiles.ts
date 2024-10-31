import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { memberType, memberTypeIdType } from './member-types.js';
import { FastifyInstance } from 'fastify';

/* 

type Profile {
  id: UUID!
  isMale: Boolean!
  yearOfBirth: Int!
  memberType: MemberType!
}

*/

export const profileType = new GraphQLObjectType<
  { memberTypeId: string },
  { db: FastifyInstance['prisma'] }
>({
  name: 'profile',
  fields() {
    return {
      id: { type: new GraphQLNonNull(UUIDType) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      memberType: {
        type: new GraphQLNonNull(memberType),
        resolve: ({ memberTypeId }, _args, { db }) =>
          db.memberType.findUnique({
            where: { id: memberTypeId },
          }),
      },
    };
  },
});

/* 

input ChangeProfileInput {
  isMale: Boolean
  yearOfBirth: Int
  memberTypeId: MemberTypeId
}

*/

export const changeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: memberTypeIdType },
  },
});

/* 

input CreateProfileInput {
  isMale: Boolean!
  yearOfBirth: Int!
  userId: UUID!
  memberTypeId: MemberTypeId!
}
  
*/
export const createProfileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: {
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(memberTypeIdType) },
  },
});
