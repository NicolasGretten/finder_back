import { parse } from "graphql";
import { basename } from "node:path";
import { exec } from "child_process";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const runPythonScript = () => {
    return new Promise((resolve, reject) => {
        exec(`python ${process.env.SCRIPT_DIRECTORY}zikinfScraper.py`, { maxBuffer: 4096 * 2000 }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(stdout.toString());
            }
        });
    });
};
const typeDefs = `#graphql
type Query {
    ZikinfScraper: String
}
`;
const resolvers = {
    Query: {
        async ZikinfScraper() {
            try {
                let result = await runPythonScript();
                const posts = JSON.parse(result.toString());
                for (const post of posts) {
                    const newPost = await prisma.post.upsert({
                        update: {
                            title: post.title,
                            price: parseInt(post.price.replace("€", "")),
                            url: post.link,
                            localisation: post.localisation
                        }, where: {
                            zikinfId: post.zikinfId,
                        },
                        create: {
                            title: post.title,
                            zikinfId: post.zikinfId,
                            price: parseInt(post.price.replace("€", "")),
                            url: post.link,
                            localisation: post.localisation
                        }
                    });
                    if (post.thumb) {
                        await prisma.image.upsert({
                            update: {}, where: {
                                url: post.thumb,
                            },
                            create: {
                                url: post.thumb,
                                postId: newPost.id,
                            }
                        });
                    }
                }
                return "Ok";
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
