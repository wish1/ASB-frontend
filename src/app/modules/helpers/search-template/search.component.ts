import {Component, ElementRef, HostBinding, Input, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Store} from "@ngrx/store";
import {AppState} from "src/app/store";
import * as fromSelectors from "src/app/store/selector";
import * as fromActions from "src/app/store/action";
import {searchBy, SearchByModel, SearchHintModel, SearchParamsModel, SearchQueryModel} from "src/app/models/searchQueryModel";
import {SnpSearchModel, TfOrCl} from "src/app/models/data.model";
import {Observable} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {MatAutocomplete, MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {FileSaverService} from "ngx-filesaver";
import * as moment from "moment";
import {SearchService} from "../../../services/search.service";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: "asb-search",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.less"],
})
export class SearchComponent implements OnInit {
    @HostBinding("class.asb-search")
    private readonly cssClass = true;

    @ViewChild("clInput") clInput: ElementRef<HTMLInputElement>;
    @ViewChild("autoCl") autocompleteCl: MatAutocomplete;

    @ViewChild("tfInput") tfInput: ElementRef<HTMLInputElement>;
    @ViewChild("autoTf") autocompleteTf: MatAutocomplete;
    private readonly nullValue: {searchInput: string} = {searchInput: ""};
    @Input()
    public width: "restricted" | "full";

    @Input()
    public isAdvanced: boolean;

    @Input()
    public searchData: SnpSearchModel[];

    public searchForm: FormGroup;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    private searchParams: SearchParamsModel;

    constructor(
        private formBuilder: FormBuilder,
        private store: Store<AppState>,
        private router: Router,
        private route: ActivatedRoute,
        private titleService: Title,
        private saverService: FileSaverService,
        private searchService: SearchService,
        private toastr: ToastrService,
    ) {}

    listOfChrs: string[] = ["all chrs"];
    public searchOptions$: Observable<{tf: SearchHintModel[], cl: SearchHintModel[]}>;
    public searchOptionsLoading$: Observable<{ tf: boolean, cl: boolean }>;


    ngOnInit() {
        this.titleService.setTitle(this.route.snapshot.data.title);
        for (let i = 1; i < 22; i++) {
            this.listOfChrs.push(String(i));
        }
        this.listOfChrs.push("X");
        this.searchForm = this.formBuilder.group({
            searchInput: "",
            searchBy: ["id"],
            chromosome: "1",
            searchTf: null,
            searchCl: null,
            tfList: [["CTCF_HUMAN"]],
            clList: [[]],
        }, {
                validator: matchingPattern("searchInput",
                    "searchBy", this.isAdvanced),
            }
        );
        this.searchParams = this.route.snapshot.queryParams as SearchParamsModel;
        this.searchForm.patchValue(
            this._convertParamsToForm(this.searchParams)
        );
        this.searchOptions$ = this.store.select(fromSelectors.selectCurrentSearchOptions);
        this.searchOptionsLoading$ = this.store.select(fromSelectors.selectCurrentSearchOptionsLoading);

        this.searchForm.get("searchCl").valueChanges.subscribe(
            s => this.store.dispatch(new fromActions.search.LoadSearchOptionsAction(
                {search: {
                        ...this.searchForm.value as SearchQueryModel,
                        searchCl: s,
                    }, tfOrCl: "cl"}
            )));
        this.searchForm.get("searchTf").valueChanges.subscribe(
            s => this.store.dispatch(new fromActions.search.LoadSearchOptionsAction(
                    {search: {
                            ...this.searchForm.value as SearchQueryModel,
                            searchTf: s,
                        }, tfOrCl: "tf"}
                )));
        if (Object.keys(this.searchParams).length > 0 && this.searchForm.valid) {
            this.store.dispatch(new fromActions.search.LoadSearchResultsAction(
                {search: this.searchForm.value, isAdvanced: this.isAdvanced}
            ));
        }
    }

    _clearSearchField() {
        this.searchForm.patchValue(this.nullValue);
    }

    _navigateToSearch() {
        if ((this.searchForm.get("searchInput").value || this.isAdvanced) &&
            this.searchForm.valid) {
            const currentFilter = this.searchForm.value as SearchQueryModel;
            this.store.dispatch(new fromActions.search.LoadSearchResultsAction(
                {search: currentFilter, isAdvanced: this.isAdvanced}
            ));
            if (this.isAdvanced) {
                this.router.navigate(["/search/advanced"], {
                    queryParams: this._convertFormToParams(this.isAdvanced)});
            } else {
                this.router.navigate(["/search/simple"], {
                    queryParams: this._convertFormToParams(this.isAdvanced)});
            }

        }
    }

    _getResultsInCsv() {
        this.toastr.info("May take some time with long results", "Info");
        this.searchService.getSearchResultsCsv(this.searchForm.value as SearchQueryModel).subscribe(
            (res) => {
                this.saverService.save(res,
                    "search_" + moment().format("YYYY-MM-DD_HH-mm") + ".csv");
            },
            (err) => {
                console.log("err");
                console.log(err.text);
            });
    }

    _checkToDisplay(id: string) {
        if (this.isAdvanced) {
            return id !== "id";
        } else {
            return this.searchForm.get("searchBy").value === id;
        }

    }

    _addChip(event: MatChipInputEvent, where: TfOrCl): void {
        const input = event.input;
        const value = event.value;

        // Reset the input value
        if (input) {
            input.value = "";
        }
        if ((value || "").trim()) {
            this.searchForm.patchValue(
                where === "tf" ?
                    {
                        searchTf: null, tfList: [
                            ...this.searchForm.value.tfList,
                            value.trim()]
                    } :
                    {
                        searchCl: null, clList: [
                            ...this.searchForm.value.clList,
                            value.trim()]
                    }
            );
        }
    }

    _selectOption(event: MatAutocompleteSelectedEvent, where: TfOrCl): void {
        if (where === "tf") {
            this.tfInput.nativeElement.value = "";
            this.searchForm.patchValue({searchTf: null, tfList: [
                    ...this.searchForm.value.tfList,
                    event.option.value
                ]
            });
        }
        if (where === "cl") {
            this.clInput.nativeElement.value = "";
            this.searchForm.patchValue({searchCl: null, clList: [
                    ...this.searchForm.value.clList,
                event.option.value
            ]});
        }
    }

    _removeChip(chipName: string, where: TfOrCl): void {
        this.searchForm.patchValue(where === "tf" ?
            {tfList: this.searchForm.value.tfList.filter(s => s !== chipName)} :
            {clList: this.searchForm.value.clList.filter(s => s !== chipName)});
    }

    _convertFormToParams(isAdvanced: boolean): Partial<SearchParamsModel> {
        const sF = this.searchForm.value as SearchQueryModel;
        if (!isAdvanced) {
            if (sF && sF.searchBy) {
                if (sF.searchBy === "pos" || this.isAdvanced !== isAdvanced) {
                    if (sF.searchInput) {
                        if (this.searchData && this.searchData.length > 0 && this.searchData.length < 4
                            && this.searchData.reduce(
                                (a, b) =>
                                    a.pos === b.pos && a.chr === b.chr ?
                                        a : {chr: "0", pos: 0}, this.searchData[0]).pos) {
                            return {
                                pos: "" + this.searchData[0].pos,
                                chr: this.searchData[0].chr,
                            };
                        } else {
                            return {
                                pos: sF.searchInput,
                                chr: sF.chromosome,
                            };
                        }
                    } else return {};

                } else {
                    return sF.searchInput ? {rs: sF.searchInput} : {};
                }

            } else {
                return sF.searchInput ? {pos: sF.searchInput, chr: sF.chromosome} : {};
            }

        } else {
            if (sF) {
                const result: Partial<SearchParamsModel> = {};
                searchBy.forEach(s => convertFormToAdvancedParam(s, sF, this.searchData, result));
                return result;
            } else return {};
        }
    }

    _convertParamsToForm(searchParams: Partial<SearchParamsModel>): Partial<SearchQueryModel> {
        if (this.isAdvanced) {
            if (searchParams) {
                const result: Partial<SearchQueryModel> = {};
                searchBy.forEach(s => convertAdvancedParamToForm(s, searchParams, this.searchData, result));
                return result;
            } else return {};

        } else {
            return searchParams && searchParams.hasOwnProperty("pos") ?
                {
                    searchBy: "pos",
                    chromosome: searchParams.chr,
                    searchInput: searchParams.pos
                } :
                {searchBy: "id", searchInput: searchParams.rs};
        }
    }
}

function convertAdvancedParamToForm(s: SearchByModel,
                     params: Partial<SearchParamsModel>,
                     searchData: SnpSearchModel[],
                     result: Partial<SearchQueryModel>) {
    switch (s) {
        case "cl":
            result.clList = params.cl ? params.cl.split(",") : [];
            return;
        case "pos":
            if (params.pos) {
                result.searchInput = params.pos;
                result.chromosome = params.chr;
            }
            return;
        case "tf":
            result.tfList = params.tf ? params.tf.split(",") : [];
            return;
    }
}
function convertFormToAdvancedParam(s: SearchByModel,
                     sF: SearchQueryModel,
                     searchData: SnpSearchModel[],
                     result: Partial<SearchParamsModel>) {
    switch (s) {
        case "cl":
            if (sF && sF.clList.length > 0) result.cl = sF.clList.join(",");
            return;
        case "pos":
            if (sF.searchInput) {
                if (searchData && searchData.length > 0 && searchData.length < 4
                    && searchData.reduce(
                        (a, b) =>
                            a.pos === b.pos && a.chr === b.chr ?
                                a : {chr: "0", pos: 0}, searchData[0]).pos) {
                    return {
                        pos: "" + searchData[0].pos,
                        chr: searchData[0].chr,
                    };
                } else {
                    result.pos = sF.searchInput;
                    result.chr = sF.chromosome;
                }
            }
            return;
        case "tf":
            if (sF && sF.tfList.length > 0) result.tf = sF.tfList.join(",");
            return;
    }
}

function matchingPattern(searchKey: string,
                         optionKey: string,
                         isAdvancedSearch: boolean) {
    return (group: FormGroup): {[key: string]: any} => {
        const search: string = group.controls[searchKey].value || "";
        const option: string = group.controls[optionKey].value;
        if ((option === "pos" && !isAdvancedSearch)
            || (isAdvancedSearch && search)) {
            if (!search.match(/\d+:\d+/)) {
                return {
                    wrongPattern: true
                };
            }
            const posArray: string[] = search.split(":");
            if (posArray.length === 2) {
                const [startPos, endPos] = posArray;
                if ((!Number(startPos) && startPos !== "0") || !Number(endPos)) {
                    return {
                        wrongPattern: true
                    };
                }
                if (Number(startPos) > Number(endPos)) {
                    return {
                        greater: true
                    };
                }
            } else {
                if (search) {
                    return {
                        wrongPattern: true
                    };
                }
            }
        }
    };
}
