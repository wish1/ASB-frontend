import {AfterViewInit, Component, HostBinding, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {Observable} from "rxjs";
import {ClSnpCutModel, SnpGenPosModel, SnpSearchModel, TfSnpCutModel} from "../../models/data.model";
import {AppState} from "../../store/reducer";
import * as fromSelectors from "src/app/store/selector";
import {Store} from "@ngrx/store";
import {AsbTableColumnModel, AsbTableDisplayedColumns} from "../../models/table.model";
import {AsbTableComponent} from "../helpers/table-template/table.component";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {map} from "rxjs/operators";
import {MatButtonToggleChange} from "@angular/material/button-toggle";
import {SearchResultsModel} from "../../models/searchQueryModel";

@Component({
  selector: "asb-search-page",
  templateUrl: "./search-page.component.html",
  styleUrls: ["./search-page.component.less"]
})
export class SearchPageComponent implements OnInit, AfterViewInit {
    @ViewChild("tableView", {static: true})
    public tableView: AsbTableComponent<SnpSearchModel>;

    @ViewChild(MatPaginator, {static: false})
    public paginator: MatPaginator;

    @ViewChild("manyValuesViewTemplate")
    public manyTransFactorsViewTemplate: TemplateRef<{value: TfSnpCutModel[]}>;

    @ViewChild("genomePositionViewTemplate")
    public genomePositionViewTemplate: TemplateRef<{value: SnpGenPosModel}>;

    @ViewChild("manyCellTypesViewTemplate")
    public manyCellTypesViewTemplate: TemplateRef<{value: ClSnpCutModel[]}>;

    @HostBinding("class.search-page")
    private readonly cssClass = true;

    public searchSnpResults$: Observable<SearchResultsModel>;
    public filteredSnpResults$: Observable<SnpSearchModel[]>;

    public searchSnpResultsLoading$: Observable<boolean>;

    isAdvancedSearch: boolean;

    public columnModel: AsbTableColumnModel<SnpSearchModel>;
    public displayedColumns: AsbTableDisplayedColumns<SnpSearchModel> = [
        "genPos",
        "rsId",
        "transFactors",
        "cellLines",
    ];
    public pageSize: number;
    public initialGroupValue: "list" | "card";

    constructor(private route: ActivatedRoute,
                private store: Store<AppState>,
                private router: Router,
                private titleService: Title) {}
    ngOnInit() {
        this.titleService.setTitle(this.route.snapshot.data.title);

        this.isAdvancedSearch = !this.router.isActive("/search/simple", false);
        if (this.route.snapshot.queryParams.rs ||
            (this.route.snapshot.queryParams.pos &&
                this.route.snapshot.queryParams.pos.match(/^\d*$/))) {
            this.initialGroupValue = "card";
            this.pageSize = 3;
        } else {
            this.initialGroupValue = "list";
            this.pageSize = 10;
        }

        this.searchSnpResults$ = this.store.select(fromSelectors.selectCurrentSearchResults);
        this.filteredSnpResults$ = this.searchSnpResults$.pipe(map(a => a.results.filter(
            (_, index) =>
                index < this.pageSize && index >= 0)));
        this.searchSnpResultsLoading$ = this.store.select(fromSelectors.selectCurrentSearchResultsLoading);
    }

    ngAfterViewInit() {
        this.columnModel = {
            genPos: {view: "Genome position",
                columnTemplate: this.genomePositionViewTemplate,
                disabledSort: true},
            rsId: {view: "rs ID"},
            transFactors: {view: "Top 5 TFs",
                columnTemplate: this.manyTransFactorsViewTemplate, disabledSort: true},
            cellLines: {view: "Top 3 cell types",
                columnTemplate: this.manyCellTypesViewTemplate, disabledSort: true},
        };
    }

    _navigateToSnp({rsId: id, alt: base}: {rsId: string, alt: string}): void {
        this.router.navigate(["snps/" + id + "/" + base]);
    }

    getPhrase(searchResults: SearchResultsModel, loading: boolean): string {
        if (loading) {
            return "Searching...";
        }
        if (!searchResults.total) {
            return "No results found";
        }
        switch (searchResults.total) {
            case 0: {
                return "No results found";
            }
            case 1: {
                return "1 result";
            }
            default: {
                return `${searchResults.total} results` +
                    (searchResults.total !== searchResults.results.length ?
                    "\nToo many to display. Use get in tsv option" : "");
            }
        }
    }

    _handleTableRowClick(row: SnpSearchModel) {
        this._navigateToSnp({rsId: row.rsId, alt: row.altBase});
    }

    _handlePageChange(page: PageEvent) {
        this._filterSnpResults(page.pageSize, page.pageIndex);
    }

    _filterSnpResults(pageSize: number, pageIndex: number): void {
        this.filteredSnpResults$ = this.searchSnpResults$.pipe(map(a => a.results.filter(
            (element, index) =>
                index < pageSize * (pageIndex + 1) && index >= pageSize * pageIndex)));
    }

    _groupToggled(event: MatButtonToggleChange) {
        if (event.value === "list") {
            this.pageSize = 10;
        } else {
            this.pageSize = 3;
        }
        if (this.paginator) this.paginator.firstPage();
        this._filterSnpResults(this.pageSize,
            this.paginator ? this.paginator.pageIndex : 0);

    }
}
