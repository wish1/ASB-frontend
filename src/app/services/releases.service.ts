import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {ReleaseModel} from "../models/releases.model";
import { Location } from "@angular/common";
import {Observable, of} from "rxjs";
import {recentRelease, releasesList} from "../helpers/constants/releases";
import {UrlService} from "./url.service";


@Injectable()
export class ReleasesService {

    constructor(private router: Router, private urlService: UrlService, private location: Location) {
    }
    private releases: ReleaseModel[] = releasesList;

    getReleaseFromPrefix(releaseUrl: string): ReleaseModel {

        const releaseIndex = this.releases.findIndex(release => release.url === releaseUrl);
        if (releaseIndex != -1) {
            return this.releases[releaseIndex];
        }

        return recentRelease;
    }
    getReleaseFromFullPath(): ReleaseModel {
        const url: string = this.location ? this.location.path() : "";
        let path = "";
        if ( url != "" && url != "/") {
            path = url.split("/")[1];
        }
        const currentRelease = this.getReleaseFromPrefix(path)
        this.urlService.currentRelease = currentRelease
        return currentRelease
    }

    getReleaseFromRoute(): Observable<ReleaseModel> {

        return of(this.getReleaseFromFullPath());
    }



}
