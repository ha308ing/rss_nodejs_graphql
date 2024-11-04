import { GraphQLObjectType, GraphQLString } from 'graphql';
import { anyType } from './any.js';

export const statsType = new GraphQLObjectType({
  name: 'prismaStats',
  fields: {
    model: { type: GraphQLString },
    operation: { type: GraphQLString },
    args: { type: anyType },
  },
});
