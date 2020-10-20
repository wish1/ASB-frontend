import {Inject, Injectable, PLATFORM_ID} from "@angular/core";
import {recentRelease} from "../helpers/constants/releases";
import {ReleaseModel} from "../models/releases.model";
import {TfOrCl} from "../models/data.model";
import {environment} from "../../environments/environment";
import {isPlatformBrowser} from "@angular/common";


@Injectable()
export class UrlService {

    private readonly hostName: string = '';
    public currentRelease: ReleaseModel = recentRelease
    private readonly isBrowser: boolean;
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.hostName = this.isBrowser ? this.getHostName() : ""
    }
    getUrlForQuery(queryType: 'browse' | 'snp' | 'search' |
        'searchOptAdv' | 'searchOptGene', tfOrCl?: TfOrCl): string {
        const currentApi: string = `${this.hostName}api/${this.currentRelease.api}`
        switch (queryType) {
            case "browse":
                return `${currentApi}/browse`
            case "search":
                return `${currentApi}/search/snps`
            case "snp":
                return `${currentApi}/snps`
            case "searchOptAdv":
                return `${currentApi}/search/${tfOrCl}/hint`
            case "searchOptGene":
                return `${currentApi}/search/gene_name/hint`
            default:
                return ""
        }

    }


    getHostName(): string {
        return `${window.location.protocol}//${window.location.hostname}${environment.production ? '': ':5000'}/`
    }

}