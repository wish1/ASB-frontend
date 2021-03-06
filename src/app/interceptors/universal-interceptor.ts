import {Injectable, Inject, Optional} from "@angular/core";
import {HttpInterceptor, HttpHandler} from "@angular/common/http";
import {Request} from "express";
import {REQUEST} from "@nguniversal/express-engine/tokens";
import {environment} from "../../environments/environment";

@Injectable()
export class UniversalInterceptor implements HttpInterceptor {

    constructor(@Optional() @Inject(REQUEST) protected request?: Request) {}

    intercept(req, next: HttpHandler) {
        let serverReq = req;
        if (this.request) {
            if (req.url.startsWith("assets") ) {
                let newUrl = `${this.request.protocol}://${this.request.get("host")}`;
                if (!req.url.startsWith("/")) {
                    newUrl += "/";
                }
                newUrl += req.url;
                serverReq = req.clone({url: newUrl});
            }
            else if (req.url.startsWith("api")) {
                let newUrl = `${this.request.protocol}://${this.request.hostname}`;
                if (environment.serverUrlPort) {
                    newUrl += `:${environment.serverUrlPort}`
                }
                if (!req.url.startsWith("/")) {
                    newUrl += "/";
                }
                newUrl += req.url;
                serverReq = req.clone({url: newUrl});
            }
        }
        return next.handle(serverReq);
    }
}

