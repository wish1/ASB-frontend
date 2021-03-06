import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    Inject,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    ViewEncapsulation,
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {isPlatformBrowser} from "@angular/common";
import {ReleasesService} from "../services/releases.service";
import {AppState} from "../store/reducer/adastra";
import {Store} from "@ngrx/store";
import * as fromActions from "src/app/store/action/adastra";
import {Subscription} from "rxjs";
import {JoyrideService} from "ngx-joyride";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
    @HostBinding("class.asb-app")
    private cssClass = true;
    private readonly isBrowser: boolean;
    private subscriptions = new Subscription();

    constructor(private router: Router,
                private route: ActivatedRoute,
                private joyrideService: JoyrideService,
                private store: Store<AppState>,
                private releasesService: ReleasesService,
                @Inject(PLATFORM_ID) private platformId) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.subscriptions.add(
            this.router.events.subscribe(() => {
                this.store.dispatch(new fromActions.releases.GetCurrentReleaseAction());
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}
