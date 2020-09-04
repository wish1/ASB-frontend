import * as fromActions from "src/app/store/action/search.action";
import {SearchHintModel, SearchQueryModel, SearchResultsModel} from "src/app/models/search-query.model";
import {
    convertSnpSearchBackendModelToSnpSearchModel
} from "../../helpers/converter/snp-model.converter";
import {
    convertSearchHintBackendModelToSearchHintModel
} from "../../helpers/converter/search-model.converter";
import {SnpSearchModel} from "../../models/data.model";

export interface SearchState {
    searchOptions: {
        tf: SearchHintModel[],
        cl: SearchHintModel[],
    };
    searchQuery: SearchQueryModel;
    searchOptionsLoading: {
        tf: boolean,
        cl: boolean,
    };
    searchResults: SearchResultsModel;
    searchResultsLoading: boolean;
    searchChangeLoading: boolean;
}
export const selectSearchOptions = (state: SearchState) => state.searchOptions;
export const selectSearchOptionsLoading = (state: SearchState) => state.searchOptionsLoading;

export const selectSearchQuery = (state: SearchState) => state.searchQuery;
export const selectSearchResults = (state: SearchState) => state.searchResults;
export const selectSearchResultsLoading = (state: SearchState) => state.searchResultsLoading;
export const selectResultsChange = (state: SearchState) => state.searchChangeLoading;

export const initialState: SearchState = {
    searchOptions: {
        tf: [],
        cl: []
    },
    searchQuery: null,
    searchOptionsLoading: {
        tf: false,
        cl: false
    },
    searchResults: {
        total: null,
        results: []
    },
    searchResultsLoading: false,
    searchChangeLoading: false
};
export function searchReducer(state: SearchState = initialState, action: fromActions.ActionUnion): SearchState {
    switch (action.type) {
        case fromActions.ActionTypes.LoadSearchOptions: {

            return {
                ...state,
                searchOptionsLoading: action.payload.tfOrCl === "tf" ?
                    {
                        tf: true,
                        cl: state.searchOptionsLoading.cl
                    } :
                    {
                        tf: state.searchOptionsLoading.tf,
                        cl: true
                    }
            };
        }
        case fromActions.ActionTypes.LoadSearchOptionsSuccess: {
            return {
                ...state,
                searchOptions: action.payload.tfOrCl === "tf" ?
                    {
                        tf: <SearchHintModel[]>action.payload.options.map(convertSearchHintBackendModelToSearchHintModel),
                        cl: state.searchOptions.cl
                    } :
                    {
                        tf: state.searchOptions.tf,
                        cl: <SearchHintModel[]>action.payload.options.map(convertSearchHintBackendModelToSearchHintModel),
                    },
                searchOptionsLoading: action.payload.tfOrCl === "tf" ?
                    {
                        tf: false,
                        cl: state.searchOptionsLoading.cl
                    } :
                    {
                        tf: state.searchOptionsLoading.tf,
                        cl: false
                    }
            };
        }
        case fromActions.ActionTypes.LoadSearchOptionsFail: {
            return {
                ...state,
                searchOptions: action.payload.tfOrCl === "tf" ?
                    {
                        tf: [],
                        cl: state.searchOptions.cl
                    } :
                    {
                        tf: state.searchOptions.tf,
                        cl: []
                    },
                searchOptionsLoading: action.payload.tfOrCl === "tf" ?
                    {
                        tf: false,
                        cl: state.searchOptionsLoading.cl
                    } :
                    {
                        tf: state.searchOptionsLoading.tf,
                        cl: false
                    }
            };
        }
        case fromActions.ActionTypes.LoadSearchResults: {
            return {
                ...state,
                searchResultsLoading: true,
                searchQuery: {
                    ...action.payload.search,
                    ...action.payload.params
                },
                searchChangeLoading: true,
            };
        }

        case fromActions.ActionTypes.LoadSearchResultsWithPagination: {
            return {
                ...state,
                searchChangeLoading: true,
                searchQuery: {
                    ...state.searchQuery,
                    ...action.payload.params
                }
            };
        }

        case fromActions.ActionTypes.LoadSearchResultsSuccess: {
            return {
                ...state,
                searchResults: {
                    total: action.payload.total,
                    results: action.payload.results.map(
                        convertSnpSearchBackendModelToSnpSearchModel) as SnpSearchModel[]
                },
                searchResultsLoading: false,
                searchChangeLoading: false
            };
        }
        case fromActions.ActionTypes.LoadSearchResultsFail: {
            return {
                ...state,
                searchResults: {results: [], total: null},
                searchResultsLoading: false,
                searchChangeLoading: false
            };
        }
        default: {
            return state;
        }
    }
}
