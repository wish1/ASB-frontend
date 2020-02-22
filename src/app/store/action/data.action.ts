import {Action} from "@ngrx/store";
import {SnpInfoBackendModel} from "src/app/models/data.model";

export enum ActionTypes {
    LoadSnpInfo = "[Data] load info model",
    LoadSnpInfoSuccess = "[Data] info model loaded successfully",
    LoadSnpInfoFail = "[Data] load info model failes",
}

export class LoadSnpInfoAction implements Action {
    readonly type = ActionTypes.LoadSnpInfo;

    constructor(public payload: {rsId: string, alt: string}) {}
}
export class LoadSnpInfoSuccessAction implements Action {
    readonly type = ActionTypes.LoadSnpInfoSuccess;

    constructor(public payload: SnpInfoBackendModel) {}
}
export class LoadSnpInfoFailAction implements Action {
    readonly type = ActionTypes.LoadSnpInfoFail;
}



export type ActionUnion =
    | LoadSnpInfoAction
    | LoadSnpInfoFailAction
    | LoadSnpInfoSuccessAction
    ;
