import {
    ChangeDetectionStrategy,
    Component,
    HostBinding,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {SearchQueryModel} from "../../../../models/search-query.model";
import {convertFormToParams} from "../../../../helpers/helper/check-functions.helper";
import {AppState} from "../../../../store/reducer/adastra";
import {Store} from "@ngrx/store";
import * as fromSelectors from "src/app/store/selector/adastra";
import {ReleaseModel} from "../../../../models/releases.model";
import {Observable} from "rxjs";
import {releasesList} from "../../../../helpers/constants/releases";


@Component({
    selector: "asb-header",
    templateUrl: "./header.component.html",
    styleUrls: ["./header.component.less"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class AsbHeaderComponent implements OnInit {
    @HostBinding("class.asb-header")
    private readonly cssClass = true;
    public navigationBarOpened = false;
    public searchQuery: Observable<SearchQueryModel>;
    public currentRelease$: Observable<ReleaseModel>;
    public releasesList: ReleaseModel[];
    public releaseOpened: boolean = false;

    constructor(private store: Store<AppState>) {}

    ngOnInit() {
        this.releasesList = releasesList;
        this.currentRelease$ = this.store.select(fromSelectors.selectCurrentRelease);
        this.searchQuery = this.store.select(fromSelectors.selectCurrentSearchQuery);
    }

    toggleNavbar(event: "toggle" | "close") {
        if (event === "toggle") {
            this.navigationBarOpened = !this.navigationBarOpened;
        } else {
            this.navigationBarOpened = false;
        }
    }

    _convertFormToParams(form: SearchQueryModel) {
        return convertFormToParams(form);
    }

    selectRelease() {
        this.releaseOpened = true
    }
}
