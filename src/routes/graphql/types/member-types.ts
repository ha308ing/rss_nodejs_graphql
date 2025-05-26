import {
  GraphQLEnumType,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

/* 

enum MemberTypeId {
  BASIC
  BUSINESS
}

*/

export const memberTypeIdType = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    BASIC: { value: 'BASIC' },
    BUSINESS: { value: 'BUSINESS' },
  },
});

/* 

type MemberType {
  id: MemberTypeId!
  discount: Float!
  postsLimitPerMonth: Int!
}

*/

export const memberType = new GraphQLObjectType({
  name: 'memberType',
  fields: {
    id: { type: new GraphQLNonNull(memberTypeIdType) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
});

export const getMemberTypeById = new GraphQLInputObjectType({
  name: 'getMemberTypeById',
  fields: {
    name: { type: memberTypeIdType },
  },
});
