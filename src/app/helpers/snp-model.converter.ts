import {
    ClSnpBackendCutModel,
    ClSnpBackendModel, ClSnpCutModel, ClSnpModel, ExpSnpBackendModel, ExpSnpModel, SnpGenPosBackendModel, SnpGenPosModel,
    SnpInfoBackendModel,
    SnpInfoModel,
    SnpSearchBackendModel,
    SnpSearchModel, TfSnpBackendCutModel, TfSnpBackendModel, TfSnpCutModel, TfSnpModel
} from "../models/data.model";


export function convertSnpInfoBackendModelToSnpInfoModel(
    model: SnpInfoBackendModel
): SnpInfoModel;
export function convertSnpInfoBackendModelToSnpInfoModel(
    model: Partial<SnpInfoBackendModel>
): Partial<SnpInfoModel>;
export function convertSnpInfoBackendModelToSnpInfoModel(
    model: Partial<SnpInfoBackendModel>
): Partial<SnpInfoModel> {
    const result: Partial<SnpInfoModel> = convertSnpModel(model) as SnpInfoModel;
    result.cellLines = model.cl_aggregated_snps.map(s => {
        return {
            ...convertClAggregatedBackendSnp(s),
            ...convertSnpModel(model)
        };
    }) as ClSnpModel[];
    result.transFactors = model.tf_aggregated_snps.map(s => {
        return {
            ...convertTfAggregatedBackendSnp(s),
            ...convertSnpModel(model)
        };
    }) as TfSnpModel[];
    return result;
}

export function convertSnpSearchBackendModelToSnpSearchModel(
    model: SnpSearchBackendModel
): SnpSearchModel;
export function convertSnpSearchBackendModelToSnpSearchModel(
    model: Partial<SnpSearchBackendModel>
): Partial<SnpSearchModel>;
export function convertSnpSearchBackendModelToSnpSearchModel(
    model: Partial<SnpSearchBackendModel>
): Partial<SnpSearchModel> {
    const result: Partial<SnpSearchModel> = convertSnpModel(model) as SnpSearchModel;
    result.genPos = convertSnpModel(model) as SnpGenPosModel;
    result.cellLines = model.cl_aggregated_snps.map(s => {
        return {
            ...convertClAggregatedBackendCutSnp(s),
            ...result.genPos
        };
    }) as ClSnpCutModel[];
    result.transFactors = model.tf_aggregated_snps.map(s => {
        return {
            ...convertTfAggregatedBackendCutSnp(s),
            ...result.genPos
        };
    }) as TfSnpCutModel[];
    return result;
}

function convertSnpModel(model: Partial<SnpGenPosBackendModel>):
    Partial<SnpGenPosModel> {
    const result: Partial<SnpGenPosModel> = {};
    result.chr = model.chromosome;
    result.pos = model.position;
    result.rsId = "rs" + model.rs_id;
    result.refBase = model.ref;
    result.altBase = model.alt;
    return result;
}

function convertClAggregatedBackendSnp(s: ClSnpBackendModel, ): Partial<ClSnpModel> {
    return {
        effectSizeRef: s.es_ref,
        effectSizeAlt: s.es_alt,
        pValueRef: s.log_p_value_ref,
        pValueAlt: s.log_p_value_alt,
        name: s.cell_line.name,
        meanBad: s.mean_bad,
        expSnps: s.exp_snps.map(convertBackendExpSnp)
    };
}
function convertTfAggregatedBackendSnp(s: TfSnpBackendModel): Partial<TfSnpModel> {
    return {
        effectSizeRef: s.es_ref,
        effectSizeAlt: s.es_alt,
        pValueRef: s.log_p_value_ref,
        pValueAlt: s.log_p_value_alt,
        name: s.transcription_factor.name,
        meanBad: s.mean_bad,
        motifConcordance: s.motif_concordance,
        motifFc: s.motif_log_2_fc,
        motifOrientation: s.motif_orientation,
        motifPAlt: s.motif_log_p_alt,
        motifPRef: s.motif_log_p_ref,
        motifPosition: s.motif_position,
        expSnps: s.exp_snps.map(convertBackendExpSnp)
    };
}

function convertClAggregatedBackendCutSnp(s: ClSnpBackendCutModel): Partial<ClSnpCutModel> {
    return {
        pValueRef: s.log_p_value_ref,
        pValueAlt: s.log_p_value_alt,
        name: s.cell_line.name,
    };
}
function convertTfAggregatedBackendCutSnp(s: TfSnpBackendCutModel): Partial<TfSnpCutModel> {
    return {
        pValueRef: s.log_p_value_ref,
        pValueAlt: s.log_p_value_alt,
        name: s.transcription_factor.name,
    };
}

function convertBackendExpSnp(s: ExpSnpBackendModel): ExpSnpModel {
    return {
        pValueAlt: s.p_value_alt,
        pValueRef: s.p_value_ref,
        bad: s.bad,
        altReadCount: s.alt_readcount,
        refReadCount: s.ref_readcount,
        align: s.experiment.align,
        expId: s.experiment.exp_id,
        clName: s.experiment.cl_name,
        tfName: s.experiment.tf_name,
    };
}
