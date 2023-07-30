import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import {
    ApolloGateway,
    LocalCompose,
    LocalGraphQLDataSource,
} from "@apollo/gateway";
import { buildSubgraphSchema } from "@apollo/subgraph";
import walk from "walk-sync";

const localServiceList = await Promise.all(
    walk("./services", {
        directories: false,
    }).map(async (file) => {
        console.log(file);
        return (await import(`../services/${file}`)).default
    })
);

const gateway = new ApolloGateway({
    debug: true,
    supergraphSdl: new LocalCompose({
        localServiceList,
    }),
    buildService: ({ name }) => {
        const service = localServiceList.find((service) => service.name === name);
        return new LocalGraphQLDataSource(buildSubgraphSchema(service));
    },
});

const server = new ApolloServer({
    gateway,
});

const { url } = await startStandaloneServer(server, { listen: { port: 8080 } });
console.log(`🚀 Server ready at ${url}`);