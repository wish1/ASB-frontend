import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {Observable} from "rxjs";
import {ClSnpModel, SnpInfoModel, TfOrCl, TfSnpModel} from "src/app/models/data.model";
import {Store} from "@ngrx/store";
import {AppState} from "../../store/reducer";
import * as fromSelectors from "src/app/store/selector";
import * as fromActions from "src/app/store/action";
import {AsbTableColumnModel, AsbTableDisplayedColumns} from "../../models/table.model";
import {AsbStatisticsComponent} from "./statistics/statistics.component";
import {FileSaverService} from "ngx-filesaver";
import {DataService} from "../../services/data.service";
import * as moment from "moment";


@Component({
    selector: "asb-snp-page",
    templateUrl: "./snp-page.component.html",
    styleUrls: ["./snp-page.component.less"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnpPageComponent implements OnInit {

    @ViewChild("cellLines", {static: true})
    public cellLinesStats: AsbStatisticsComponent<ClSnpModel>;
    @ViewChild("transcriptionFactors", {static: true})
    public tfStats: AsbStatisticsComponent<TfSnpModel>;

    public id: string;
    public alt: string;
    public snpData$: Observable<SnpInfoModel>;
    public snpDataLoading$: Observable<boolean>;

    public clColumnModel: AsbTableColumnModel<Partial<ClSnpModel>> = {
        name: {view: "Cell type", valueConverter: v => v},
       ...commonColumnModel,
    };
    public clDisplayedColumns: AsbTableDisplayedColumns<ClSnpModel> = [
        ...commonInitialDisplayedColumns,
    ];


    public tfColumnModel: AsbTableColumnModel<Partial<TfSnpModel>> = {
        name: {view: "Uniprot ID", valueConverter: v => v},
        ...commonColumnModel,
        motifFc: {view: "Fold change", valueConverter: v => v !== null ? v.toFixed(2) : "No info"},
        motifConcordance: {view: "Concordance", valueConverter:
                    v => v !== null ? v ? "concordant" : "discordant"  : "NaN"},
    };
    public tfDisplayedColumns: AsbTableDisplayedColumns<TfSnpModel> = [
        ...commonInitialDisplayedColumns,
        "motifFc",
    ];
    public phenotypesEmpty: boolean;



    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private router: Router,
        private saverService: FileSaverService,
        private dataService: DataService,
        private titleService: Title) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false; }

    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get("rsId");
        this.alt = this.route.snapshot.paramMap.get("alt");
        this.titleService.setTitle(this.route.snapshot.data.title + this.id);

        this.snpData$ = this.store.select(fromSelectors.selectSnpInfoDataById, this.id + this.alt);
        this.snpDataLoading$ = this.store.select(fromSelectors.selectSnpInfoDataLoadingById, this.id + this.alt);
        this.store.dispatch(new fromActions.data.InitSnpInfoAction(
            {rsId: this.id, alt: this.alt}));
    }

    searchFunction(data: ClSnpModel, search: string): boolean {
        return data.name.toLowerCase().indexOf(search.trim().toLowerCase()) !== -1;
    }

    _downloadFile(options: {
        columns: string[],
        filter: string,
    }, where: TfOrCl) {
        this.dataService.getSnpInfoByIdCsv(
            this.id, this.alt, where, options.columns, options.filter).subscribe(
        (res) => {
                this.saverService.save(res,
                `AD_ASTRA_${this.id}_${this.alt}_${moment().format("YYYY-MM-DD_HH-mm")}.csv`);
            },
        (err) => {
                console.log("err");
                console.log(err.text);
            }
        );
    }
}

const commonColumnModel:
    AsbTableColumnModel<Partial<TfSnpModel> | Partial<ClSnpModel>> = {
    effectSizeRef: {view: "Effect size ref", valueConverter: v => v !== null ? v.toFixed(2) : "NaN"},
    effectSizeAlt: {view: "Effect size alt", valueConverter: v => v !== null ? v.toFixed(2) : "NaN"},
    pValueRef: {view: "p-value ASB ref", valueConverter: v => v !== null ? v.toFixed(2) : "NaN"},
    pValueAlt: {view: "p-value ASB alt", valueConverter: v => v !== null ? v.toFixed(2) : "NaN"},
    meanBad: {view: "mean BAD", valueConverter: v => v.toFixed(2), helpMessage: "this is mean BAD"}
};
const commonInitialDisplayedColumns: AsbTableDisplayedColumns<Partial<TfSnpModel> | Partial<ClSnpModel>> = [
    "name",
    "effectSizeRef",
    "effectSizeAlt",
    "pValueRef",
    "pValueAlt",
    "meanBad",
];
