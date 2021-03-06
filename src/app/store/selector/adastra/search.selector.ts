import {createSelector} from "@ngrx/store";
import * as fromRoot from "../../reducer/adastra";
import * as fromSearch from "src/app/store/reducer/adastra/search.reducer";

export const selectCurrentSearchOptions = createSelector(fromRoot.selectSearch, fromSearch.selectSearchOptions);
export const selectCurrentSearchOptionsLoading = createSelector(fromRoot.selectSearch,
    fromSearch.selectSearchOptionsLoading);
export const selectCurrentSearchResults = createSelector(fromRoot.selectSearch, fromSearch.selectSearchResults);
export const selectCurrentSearchResultsLoading = createSelector(fromRoot.selectSearch,
    fromSearch.selectSearchResultsLoading);
export const selectCurrentSearchResultsChanged = createSelector(fromRoot.selectSearch,
    fromSearch.selectResultsChange);
export const selectCurrentSearchQuery = createSelector(fromRoot.selectSearch,
    fromSearch.selectSearchQuery);

export const selectCurrentSearchByGeneNameOptions = createSelector(fromRoot.selectSearch,
    fromSearch.selectSearchByGeneNameOptions)
export const selectCurrentSearchByGeneNameOptionsLoading = createSelector(fromRoot.selectSearch,
    fromSearch.selectSearchByGeneNameOptionsLoading)

export const selectSelectedGene = createSelector(fromRoot.selectSearch,
    fromSearch.selectCurrentSelectedGene)
