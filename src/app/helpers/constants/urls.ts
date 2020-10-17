import {environment} from "../../../environments/environment";
import {recentRelease} from "./releases";
const serverUrl = environment.serverUrl + `/api/${recentRelease.api}`;

export const browseUrl = serverUrl + "/browse";
export const snpsInfoUrl = serverUrl + "/snps";
export const searchOptionsUrl = (tfOrCl: "tf" | "cl") => serverUrl + "/search/" + tfOrCl + "/hint";
export const searchOptionsByGeneNameUrl = serverUrl + "/search/gene_name/hint";
export const searchSnpsResultsUrl = serverUrl + "/search/snps";
