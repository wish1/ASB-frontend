import * as fromActions from "src/app/store/action/data.action";
import {phenotypesBackendModel, PhenotypesModel, SnpInfoModel} from "src/app/models/data.model";
import {convertSnpInfoBackendModelToSnpInfoModel} from "../../helpers/snp-model.converter";

export interface DataState {
    snpData: SnpInfoModel,
    snpDataLoading: boolean
}
export const selectSnpData = (state: DataState) => state.snpData;
export const selectSnpDataLoading = (state: DataState) => state.snpDataLoading;

export const initialState: DataState = {
    snpDataLoading: true,
    snpData: {
        rsId: null,
        cellLines: [],
        pos: null,
        chr: null,
        transFactors: [],
        refBase: null,
        altBase: null,
        phenotypes: {
            clinvar: [],
            ebi: [],
            grasp: [],
            finemapping: [],
            QTL: [],
            phewas: [],
        }
    }
};
export function dataReducer(state: DataState = initialState, action: fromActions.ActionUnion): DataState {
    switch (action.type) {
        case fromActions.ActionTypes.LoadSnpInfo: {
            return {
                ...state,
                snpDataLoading: true,
            };
        }
        case fromActions.ActionTypes.LoadSnpInfoSuccess: {
            let newPhenotypes: PhenotypesModel = {
                ebi: [],
                phewas: [],
                grasp: [],
                finemapping: [],
                clinvar: [],
                QTL: [],
            };
            Object.keys(state.snpData.phenotypes).forEach(
                s => newPhenotypes[s] = reduceToDb(s, action.payload.phenotypes)
            );
            console.log(newPhenotypes);
            return {
                ...state,
                snpData: {
                    ...convertSnpInfoBackendModelToSnpInfoModel(action.payload),
                    phenotypes: newPhenotypes
                },

                snpDataLoading: false,
            };
        }
        case fromActions.ActionTypes.LoadSnpInfoFail: {
            return {
                ...state,
                snpDataLoading: false,
            };
        }
        default: {
            return state;
        }
    }
}

function reduceToDb(dbName: string, phenotypes: phenotypesBackendModel[]): string[] {
    return phenotypes.filter(s => s.db_name === dbName).map(s => s.phenotype_name)
}
