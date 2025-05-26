import { GraphQLScalarType } from 'graphql';

export const anyType = new GraphQLScalarType({
  name: 'any',
  serialize(value) {
    return value;
  },
  parseValue(value) {
    return value;
  },
  parseLiteral(value) {
    return value;
  },
});
