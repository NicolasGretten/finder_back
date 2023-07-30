import { basename } from "node:path";
import { parse } from "graphql";
import { DateTimeResolver } from 'graphql-scalars';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const typeDefs = `
  type Post {
    id: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    title: String!
    content: String
    published: Boolean
    zikinfId: String
    price: Int
    isForSale: Boolean
    isForTrade: Boolean
    images: [Image]
  }

  type Query {
    allPosts: [Post]
  }

  type Image {
    id: Int!
    url: String!
    post: Post!
    postId: Int!
  }
  scalar DateTime
`;
export const resolvers = {
    Query: {
        allPosts: (_parent, _args, context) => {
            return prisma.post.findMany();
        },
    },
    DateTime: DateTimeResolver,
    Post: {
        images: (parent) => {
            // Renvoie un tableau d'images associées au post
            return prisma.image.findMany({ where: { postId: parent.id } });
        },
    },
};
export default {
    name: basename(import.meta.url),
    resolvers,
    typeDefs: parse(typeDefs),
};
