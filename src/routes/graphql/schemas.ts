import { Type } from '@fastify/type-provider-typebox';
import { GraphQLSchema } from 'graphql';
import { rootQueryType } from './types/root-query.js';
import { mutationsType } from './types/mutations.js';
import { postType } from './types/posts.js';
import { profileType } from './types/profiles.js';
import { userType } from './types/users.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const schema = new GraphQLSchema({
  query: rootQueryType,
  mutation: mutationsType,
  types: [postType, profileType, userType],
});
