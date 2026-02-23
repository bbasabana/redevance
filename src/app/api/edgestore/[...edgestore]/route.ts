import { initEdgeStore } from "@edgestore/server";
import { createEdgeStoreNextHandler } from "@edgestore/server/adapters/next/app";
import { auth } from "@/auth";

type Context = {
    userId: string;
};

async function createContext({ req }: { req: Request }): Promise<Context> {
    const session = await auth();
    return {
        userId: session?.user?.id || "anonymous",
    };
}

const es = initEdgeStore.context<Context>().create();

/**
 * This is the main router for the edgestore buckets.
 */
const edgeStoreRouter = es.router({
    publicFiles: es.fileBucket({
        maxSize: 1024 * 1024 * 5, // 5MB
        accept: ["image/jpeg", "image/png", "application/pdf"],
    }),
    profileDocuments: es.fileBucket({
        maxSize: 1024 * 1024 * 10, // 10MB
        accept: ["image/jpeg", "image/png", "application/pdf"],
    }).path(({ ctx }) => [{ owner: ctx.userId }]),
});

const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
    createContext,
});

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe hooks on the client side.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
