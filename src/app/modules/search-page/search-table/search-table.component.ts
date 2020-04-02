import {
    Component,
    HostBinding,
    Input,
    OnInit,
    TemplateRef,
    ViewChild
} from "@angular/core";
import {ActivatedRoute,  Router} from "@angular/router";
import {ClSnpCutModel, SnpGenPosModel, SnpSearchModel, TfSnpCutModel} from "../../../models/data.model";
import {AsbTableColumnModel, AsbTableDisplayedColumns} from "../../../models/table.model";
import {AsbTableComponent} from "../../helpers/table-template/table.component";
import {SearchParamsModel} from "../../../models/searchQueryModel";



@Component({
    selector: "asb-search-table",
    templateUrl: "./search-table.component.html",
    styleUrls: ["../search-page.component.less"]
})
export class SearchPageTableComponent implements OnInit {
    @ViewChild("tableView", {static: true})
    public tableView: AsbTableComponent<SnpSearchModel>;

    @ViewChild("manyValuesViewTemplate", {static: true})
    public manyTransFactorsViewTemplate: TemplateRef<{value: TfSnpCutModel[]}>;

    @ViewChild("genomePositionViewTemplate", {static: true})
    public genomePositionViewTemplate: TemplateRef<{value: SnpGenPosModel}>;

    @ViewChild("manyCellTypesViewTemplate", {static: true})
    public manyCellTypesViewTemplate: TemplateRef<{value: ClSnpCutModel[]}>;

    @HostBinding("class.search-page")
    private readonly cssClass = true;

    @Input()
    public searchResults: SnpSearchModel[];



    public columnModel: AsbTableColumnModel<any>;
    public displayedColumns: AsbTableDisplayedColumns<any> = [
        "genPos",
        "rsId",

    ];

    constructor(private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.columnModel = {
            genPos: {view: "Genome position",
                columnTemplate: this.genomePositionViewTemplate,
                disabledSort: true},
            rsId: {view: "rs ID"},

        };
        if ((!this.router.isActive("/search/simple", false) &&
            !this.route.snapshot.queryParams.tf &&
            !this.route.snapshot.queryParams.cl) ||
            this.router.isActive("/search/simple", false)) {
            this.columnModel = {
                ...this.columnModel,
                transFactors: {view: "Top 5 TFs",
                    columnTemplate: this.manyTransFactorsViewTemplate, disabledSort: true},
                cellLines: {view: "Top 3 cell types",
                    columnTemplate: this.manyCellTypesViewTemplate, disabledSort: true},
            };
            this.displayedColumns = [
                ...this.displayedColumns,
                "transFactors",
                "cellLines",
            ];
        } else {
            this.displayedColumns = [
                ...this.displayedColumns,
                ...this.paramsToDisplayedColumns(),
            ];
            this.columnModel = {
                ...this.columnModel,
                ...this.paramsToColumnModel(),
            };
            this.searchResults = this.searchResults.map((s, index) => {
                return {...s, ...this.paramsToData(this.searchResults)[index]};
            });
        }
    }


    _navigateToSnp({rsId: id, alt: base}: {rsId: string, alt: string}): void {
        this.router.navigate(["snps/" + id + "/" + base]);
    }

    _handleTableRowClick(row: SnpSearchModel) {
        this._navigateToSnp({rsId: row.rsId, alt: row.altBase});
    }

    private paramsToColumnModel(): AsbTableColumnModel<any> {
        const params = this.route.snapshot.queryParams as SearchParamsModel;
        const result = {};
        if (params.cl) {
            params.cl.split(",").forEach(
                s => {
                    result[convertNameToValue(s, "Ref")] = {
                        view: convertNameToView(s, "Ref"),
                        valueConverter: v => v.toFixed(2),
                        helpMessage: "-log10 FDR"
                    };
                    result[convertNameToValue(s, "Alt")] = {
                        view: convertNameToView(s, "Alt"),
                        valueConverter: v => v.toFixed(2),
                        helpMessage: "-log10 FDR"
                    };
                });
        }
        if (params.tf) {
            params.tf.split(",").forEach(
                s => {
                    result[convertNameToValue(s, "Ref")] = {
                        view: convertNameToView(s, "Ref"),
                        valueConverter: v => v.toFixed(2),
                        helpMessage: "-log10 FDR"};
                    result[convertNameToValue(s, "Alt")] = {
                        view: convertNameToView(s, "Alt"),
                        valueConverter: v => v.toFixed(2),
                        helpMessage: "-log10 FDR"
                    };
                });
        }
        return result;
    }

    private paramsToDisplayedColumns(): string[] {
        const params = this.route.snapshot.queryParams as SearchParamsModel;
        const result: string[] = [];
        if (params.cl) {
            params.cl.split(",").forEach(
                s => {
                    result.push(convertNameToValue(s, "Ref"));
                    result.push(convertNameToValue(s, "Alt"));
                });
        }
        if (params.tf) {
            params.tf.split(",").forEach(
                s => {
                    result.push(convertNameToValue(s, "Ref"));
                    result.push(convertNameToValue(s, "Alt"));
                });
        }
        return result;
    }

    private paramsToData(data: SnpSearchModel[]): any[] {
        const params = this.route.snapshot.queryParams as SearchParamsModel;
        return data.map(s => {
            const result = {};
            if (params.tf) {
                params.tf.split(",").forEach(
                    p => {
                        result[convertNameToValue(p, "Alt")] =
                            s.transFactors ? s.transFactors.filter(f => f.name === p)[0].pValueAlt : "NaN";
                        result[convertNameToValue(p, "Ref")] =
                            s.transFactors ? s.transFactors.filter(f => f.name === p)[0].pValueRef : "NaN";
                    });
            }
            if (params.cl) {
                params.cl.split(",").forEach(
                    p => {
                        result[convertNameToValue(p, "Alt")] =
                            s.cellLines ? s.cellLines.filter(f => f.name === p)[0].pValueAlt : "NaN";
                        result[convertNameToValue(p, "Ref")] =
                            s.cellLines ? s.cellLines.filter(f => f.name === p)[0].pValueRef : "NaN";
                    });
            }
            return result;
        });
    }
}

function convertNameToValue(name: string, allele: "Ref" | "Alt"): string {
    return name + "PVal" + allele;
}
function convertNameToView(name: string, allele: "Ref" | "Alt"): string {
    return name + "\nFDR " + allele;
}