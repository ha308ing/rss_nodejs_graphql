import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, validate, parse } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { createLoaders } from './loaders/createLoaders.js';
import type { FastifyInstance } from 'fastify';

export type TContext = {
  db: FastifyInstance['prisma'];
  loaders: ReturnType<typeof createLoaders>;
};

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async preHandler(req, res) {
      const errors = validate(schema, parse(req.body.query), [depthLimit(5)]);
      if (errors.length > 0) return res.send({ errors });
    },

    async handler(req) {
      const loaders = createLoaders(prisma);

      return graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { db: prisma, loaders },
      });
    },
  });
};

export default plugin;
