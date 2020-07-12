import {TfSnpModel} from "../../../models/data.model";
import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";

@Component({
    selector: "asb-motifs",
    templateUrl: "./asb-motifs.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsbMotifsComponent implements OnInit {

    constructor() { }

    @Input()
    transcriptionFactors: TfSnpModel[];

    @Input()
    openedTf: TfSnpModel;

    ngOnInit(): void {

    }

    getExpandedIndex(tfSnpModels: TfSnpModel[]) {
        return tfSnpModels.indexOf(this.openedTf)
    }

    makeImagePath(tf: TfSnpModel): string {
        return `pngs/${tf.name}_${tf.rsId.slice(2)}_${tf.altBase}.png`
    }

}

