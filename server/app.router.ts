import * as express from "express";
import * as routers from "./routers";


const appRouter = express.Router();

const routesApi = [
    {
        url: "",
        middleware: routers.dataRouter
    },
    {
        url: "search",
        middleware: routers.searchRouter
    },
];

routesApi.forEach(router => appRouter.use("/api/v1/" + router.url, router.middleware));

export default appRouter;
