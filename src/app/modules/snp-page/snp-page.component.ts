import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable, Subscription} from "rxjs";
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
import {calculateColorForOne} from "../../helpers/colors.helper";
import {SeoService} from "../../services/seo.servise";
import {ToastrService} from "ngx-toastr";
import {MatExpansionPanel} from "@angular/material/expansion";
import {AsbMotifsComponent} from "./asb-motifs/asb-motifs.component";

@Component({
    selector: "asb-snp-page",
    templateUrl: "./snp-page.component.html",
    styleUrls: ["./snp-page.component.less"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnpPageComponent implements OnInit, OnDestroy {

    @ViewChild("cellLines", {static: true})
    public cellLinesStats: AsbStatisticsComponent<ClSnpModel>;
    @ViewChild("transcriptionFactors", {static: true})
    public tfStats: AsbStatisticsComponent<TfSnpModel>;

    @ViewChild('motifPanel')
    public motifPanel: MatExpansionPanel;

    @ViewChild('asbMotifsComponent')
    public asbMotifsComponent: AsbMotifsComponent

    public id: string;
    public alt: string;
    public snpData$: Observable<SnpInfoModel>;
    public snpDataLoading$: Observable<boolean>;

    public clColumnModel: AsbTableColumnModel<Partial<ClSnpModel>>;
    public clDisplayedColumns: AsbTableDisplayedColumns<ClSnpModel> = [
        ...commonInitialDisplayedColumns,
    ];

    private commonColumnModel:
        AsbTableColumnModel<Partial<TfSnpModel> | Partial<ClSnpModel>>;


    public tfColumnModel: AsbTableColumnModel<Partial<TfSnpModel>>;
    public tfDisplayedColumns: AsbTableDisplayedColumns<TfSnpModel> = [
        ...commonInitialDisplayedColumns,
        "motifFc",
        "motifConcordance",
    ];

    private subscriptions: Subscription = new Subscription();

    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
        private router: Router,
        private saverService: FileSaverService,
        private dataService: DataService,
        private toastr: ToastrService,
        private seoService: SeoService
    ) {}

    ngOnInit() {
        this.subscriptions.add(
            this.route.paramMap.subscribe(
                (p) => {
                    this.id = p.get("rsId")
                    this.alt = p.get("alt")
                    this.store.dispatch(new fromActions.data.InitSnpInfoAction(
                        {rsId: this.id, alt: this.alt}));
                }

            )
        )
        this.snpData$ = this.store.select(fromSelectors.selectSnpInfoDataById, this.id + this.alt);
        this.snpDataLoading$ = this.store.select(fromSelectors.selectSnpInfoDataLoadingById, this.id + this.alt);
        this.subscriptions.add(
            this.snpData$.subscribe(s => s ?
                this.seoService.updateSeoInfo({
                    title: this.route.snapshot.data.title(this.id),
                    description: this.route.snapshot.data.description(this.id),
                    keywords: s.transFactors.slice(0, 10).join(","),
                }) :
                null
            )
        );
        this.commonColumnModel = {
            effectSizeRef: {
                view: "Effect size Ref",
                valueConverter: v => v !== null ? v.toFixed(2) : "n/a",
            },
            effectSizeAlt: {
                view: "Effect size Alt",
                valueConverter: v => v !== null ? v.toFixed(2) : "n/a"
            },
            pValueRef: {
                view: "-log₁₀FDR Ref",
                valueConverter: v => v !== null ? v.toFixed(2) : "NaN",
                colorStyle: row => this._calculateColor(row, "ref")
            },
            pValueAlt: {
                view: "-log₁₀FDR Alt",
                valueConverter: v => v !== null ? v.toFixed(2) : "NaN",
                colorStyle: row => this._calculateColor(row, "alt")
            },
            meanBad: {view: "Mean BAD", valueConverter: v => v.toFixed(2)}
        };

        this.clColumnModel = {
            name: {view: "Cell type", valueConverter: v => v},
            ...this.commonColumnModel,
        };
        this.tfColumnModel = {
            name: {view: "Uniprot ID", valueConverter: v => v},
            ...this.commonColumnModel,
            motifFc: {
                view: "Motif fold change",
                valueConverter: v => v !== null ? v.toFixed(2) : "n/a",
                helpMessage: 'log₂(Alt/Ref motif p-value)'
            },
            motifPRef: {
                view: "-log₁₀ Motif Ref p-value",
                valueConverter: v => v !== null ? v.toFixed(2) : "n/a",

            },
            motifPAlt: {
                view: "-log₁₀ Motif Alt p-value",
                valueConverter: v => v !== null ? v.toFixed(2) : "n/a",
            },
            motifOrientation: {
                view: 'Motif orientation',
                valueConverter: v => v !== null ? v ? '+' : '-' : "n/a",
            },
            motifConcordance: {
                view: "Motif concordance",
                valueConverter: v => v !== null ? v : "n/a",
            },
            motifPosition: {
                view: "Motif position",
                valueConverter: v => v !== null ? '' + (v + 1) : "n/a",
                helpMessage: 'SNP position relative to the TF motif (1-based)'
            },
        };
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    _downloadFile(options: {
        columns: string[],
        filter: string,
    }, where: TfOrCl) {
        this.subscriptions.add(
            this.dataService.getSnpInfoByIdCsv(
                this.id, this.alt, where, options.columns, options.filter).subscribe(
                (res) => {
                    this.saverService.save(res,
                        `AD_ASTRA_${this.id}_${this.alt}_${moment().format("YYYY-MM-DD_HH-mm")}.tsv`);
                },
                (err) => {
                    this.toastr.error(err.message, "Error");
                }
            )
        );
    }

    _downloadPage() {
        this.subscriptions.add(
            this.dataService.getSnpInfoById({rsId: this.id, alt: this.alt}).subscribe(
                (res) => {
                    const blob = new Blob([JSON.stringify(res)],
                        {type: "application/json"});
                    this.saverService.save(blob, `AD_ASTRA_page_${this.id}_${this.alt}.json`);
                },
                (err) => {
                    console.log(err);
                }
            )
        );
    }

    _calculateColor(row: TfSnpModel | ClSnpModel, w: "ref" | "alt"): string {
        return w === "ref" ?
            calculateColorForOne(row.pValueRef,
                row.refBase) :
            calculateColorForOne(row.pValueAlt,
                row.altBase);
    }

    _createSnpName(snpData: SnpInfoModel, where: TfOrCl) {
        return (row: ClSnpModel | TfSnpModel) => `${snpData.rsId} ${snpData.refBase}>${snpData.altBase}` +
            (where === "cl" ? " in " : " of ") + this._getName(row);
    }

    _getName(row: ClSnpModel | TfSnpModel) {
        return row ? row.name : "fail";
    }

    filterCondition(tf: TfSnpModel): boolean {
        return !!(tf.motifConcordance && tf.motifConcordance !== "No Hit")
    }

    _getGoodTfs(tfs: TfSnpModel[]): TfSnpModel[] {
        return tfs.filter(s => this.filterCondition(s)).sort(
            (a, b) =>
                Math.max(b.effectSizeAlt, b.effectSizeRef) - Math.max(a.effectSizeAlt, a.effectSizeRef))
    }

    openMotifAnalysis($event: TfSnpModel, tfs: TfSnpModel[]) {
        const id = tfs.indexOf($event)
        const chosenExpansionPanel =this.asbMotifsComponent.expansionPanels.filter(
            (s, i) => i == id)[0]
        chosenExpansionPanel.open()

        if (this.motifPanel.closed) {
            this.motifPanel.open()
        }
        document.getElementById('tf' + id).scrollIntoView({behavior: "smooth"})
    }

}

const commonInitialDisplayedColumns: AsbTableDisplayedColumns<Partial<TfSnpModel> | Partial<ClSnpModel>> = [
    "name",
    "effectSizeRef",
    "effectSizeAlt",
    "pValueRef",
    "pValueAlt",
    "meanBad",
];
