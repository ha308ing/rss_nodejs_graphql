import { GraphQLObjectType } from 'graphql';
import { rootQueryType } from './root-query.js';
import { mutationsType } from './mutations.js';

/* 

schema {
  query: RootQueryType
  mutation: Mutations
}

*/

export const schemaType = new GraphQLObjectType({
  name: 'schema',
  fields: {
    query: { type: rootQueryType },
    mutation: { type: mutationsType },
  },
});
