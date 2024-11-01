import {
  GraphQLBoolean,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';
import { UUIDType } from './uuid.js';
import { memberType, memberTypeIdType } from './member-types.js';
import { TContext } from '../index.js';
import { Profile } from '@prisma/client';

/* 

type Profile {
  id: UUID!
  isMale: Boolean!
  yearOfBirth: Int!
  memberType: MemberType!
}

*/

export const profileType = new GraphQLObjectType<Profile, TContext>({
  name: 'profile',
  fields() {
    return {
      id: { type: new GraphQLNonNull(UUIDType) },
      isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
      yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
      memberType: {
        type: new GraphQLNonNull(memberType),
        resolve: ({ memberTypeId }, _args, { loaders }) =>
          loaders.memberTypes.load(memberTypeId),
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
