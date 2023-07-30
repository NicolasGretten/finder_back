import { parse } from "graphql";
import { basename } from "node:path";
import { exec } from 'child_process';
const runPythonScript = () => {
    return new Promise((resolve, reject) => {
        exec(`python ${process.env.SCRIPT_DIRECTORY}ZikinfAutoRefresh.py -u Percevval -p nicolas160795`, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout.toString().replace(/(\r\n|\n|\r)/gm, ""));
            }
        });
    });
};
const typeDefs = `#graphql
type Query {
    ZikinfAutoRefresh: String
}
`;
const resolvers = {
    Query: {
        async ZikinfAutoRefresh() {
            try {
                const result = await runPythonScript();
                return result;
            }
            catch (error) {
                console.error('Error executing Python script:', error);
                return null; // or handle the error appropriately
            }
        },
    },
};
export default {
    name: basename(import.meta.url),
    resolvers,
    typeDefs: parse(typeDefs),
};
