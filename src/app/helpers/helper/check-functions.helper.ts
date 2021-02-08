import {GeneModel, SearchParamsModel, SearchQueryModel} from "../../models/search-query.model";
import {formCheckboxesToList} from "../converters/search-model.converter";
import {SnpSearchModel, TfSnpModel} from "../../models/data.model";
import {MatSort} from "@angular/material/sort";
import {compareConcordance} from "../constants/constants";

export function getPaginatorOptions(len: number): number[] {
    return len > 50 ?
        [5, 10, 25, 50, len] :
        [5, 10, 25, 50];
}

export function stringOrNumberConverter(v: number | string, fractionDigits: number = 2) {
    if (v === null) {
        return 'n/a'
    }
    if (typeof v == 'number') {
        return v.toFixed(fractionDigits)
    } else {
        return v === 'infinity' ? 'ထ' : v
    }
}
export function stringToNum(v: string, toInvert: boolean = false): string | number{

    if (v === null) {
        return v
    }
    const numV = Number(v)
    if (!isNaN(numV)) {
        return numV * (toInvert ? -1 : 1)
    } else {
        return v
    }
}
export function checkIfNumberOrFrac(data: string ) {
    if (data.match(/^\d+$/)) {
        return Number(data);
    }
    if (data.match(/^\d+\/\d+$/)) {
        const twoNums: string[] = data.split("/");
        return Number(twoNums[0]) / Number(twoNums[1]);
    }
    return data;
}


export function isValidPosInterval(search: string): boolean {
    search = search.trim();
    if (search.match(/^\d+-\d+$/)) {
        const posArray: string[] = search.split("-");
        if (posArray.length === 2) {
            return true;
        }
    }
    return false;
}

export function checkOneResult(searchData: SnpSearchModel[]): boolean {
    return !!(searchData &&
        searchData.length > 0 && searchData.length < 4
        && searchData.reduce((a, b) =>
            a.pos === b.pos && a.chr === b.chr ?
                b : {chr: "chr0", pos: 0}, searchData[0]).pos);
}

export function convertFormToParams(form: SearchQueryModel, oldIsAdvanced?: boolean,
                                    searchData?: SnpSearchModel[], selectedGene?: GeneModel): Partial<SearchParamsModel> {

    if (form && !form.isAdvanced) {
        if (form.searchBy) {
            if (oldIsAdvanced && form.isAdvanced !== oldIsAdvanced) {
                form.searchBy = "pos";
            }
            switch (form.searchBy) {
                case "id":
                    return form.rsId ? {rs: form.rsId.trim()} : {};
                case "pos":
                    let result = {};
                    if (form.chromPos.pos) {
                        result = {
                            ...result,
                            pos: form.chromPos.pos.trim()
                        };
                    }
                    if (form.chromPos.chr) {
                        result = {
                            ...result,
                            chr: form.chromPos.chr.trim()
                        };
                    }
                    return result;
                case "geneId":
                    return form.geneId ? {g_id: form.geneId.trim()} : {};
                case "geneName":
                    return form.geneName ? {g_name: form.geneName.trim()} : {};
            }

        } else {
            return form.rsId ? {pos: form.chromPos.pos, chr: form.chromPos.chr} : {};
        }

    } else {
        if (form) {
            const result: Partial<SearchParamsModel> = form.fdr ? {fdr: form.fdr} : {};
            if (form.clList.length > 0) { result.cl = form.clList.join("@"); }
            if (form.chromPos.pos) {
                if (checkOneResult(searchData) && !oldIsAdvanced &&
                    form.searchBy === 'id' &&
                    !isValidPosInterval(form.chromPos.pos.trim())) {
                    result.pos = "" + searchData[0].pos;
                    result.chr = searchData[0].chr.slice(3);
                }
                else {
                    result.pos = form.chromPos.pos.trim();
                    result.chr = form.chromPos.chr.trim();
                }
            } else if (form.chromPos.chr) {
                result.chr = form.chromPos.chr;
            }
            if (!oldIsAdvanced && selectedGene && selectedGene.chr && (form.geneName || form.geneId)) {
                result.pos = `${selectedGene.startPos}-${selectedGene.endPos}`
                result.chr = selectedGene.chr.slice(3)
            }

            if (form.tfList.length > 0) {
                result.tf = form.tfList.join(",");
            }
            const phenList: string = formCheckboxesToList(form);
            if (phenList) {
                result.phe_db = phenList;
            }
            const concList: string = formCheckboxesToList(form, "concordance");
            if (concList) {
                result.motif_conc = concList;
            }
            return result;
        } else { return {}; }
    }
}

function applyFunction(a: string | number, b: string | number, isBadElem: ((x: string | number) => boolean)): number {
    if (isBadElem(a) && isBadElem(b)) {
        return 0;
    } else {
        if (isBadElem(a)) {
            return 1;
        } else {
            return -1;
        }
    }
}

export function compareData(a: TfSnpModel, b: TfSnpModel, sort: MatSort): number {
    let result = 0;
    if (sort.active) {
        if (a[sort.active] && b[sort.active]) {
            if (sort.active == "motifConcordance") {
                if (a.motifConcordance != "No Hit" && b.motifConcordance != "No Hit") {
                    result = compareConcordance(a.motifConcordance, b.motifConcordance);
                } else {
                    return applyFunction(a.motifConcordance, b.motifConcordance,
                        x => x == "No Hit" );
                }

            } else {
                result = a[sort.active] > b[sort.active] ? 1 : -1;
            }
        } else {
            return applyFunction(a[sort.active], b[sort.active], x => !x);
        }
    }
    return result * (sort.direction == "asc" ? 1 : -1);
}
