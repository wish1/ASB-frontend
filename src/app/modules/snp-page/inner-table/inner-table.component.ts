import {ChangeDetectionStrategy, Component, Input, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ExpSnpModel} from "../../../models/data.model";
import {AsbTableColumnModel, AsbTableDisplayedColumns} from "../../../models/table.model";
import {getPaginatorOptions} from "../../../helpers/check-functions.helper";
import {AsbTableComponent} from "../../helpers/table-template/table.component";

@Component({
    selector: "asb-inner-table",
    templateUrl: "./inner-table.component.html",
    styleUrls: ["./inner-table.component.less"],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InnerTableComponent implements OnInit {
    @ViewChild("tableView", {static: true})
    public tableView: AsbTableComponent<ExpSnpModel>;

    @ViewChild("alignTemplate", {static: true})
    public alignViewTemplate: TemplateRef<{value: number}>;

    constructor() { }

    public columnModel: AsbTableColumnModel<ExpSnpModel>;
    public displayedColumns: AsbTableDisplayedColumns<ExpSnpModel> = [
        "refReadCount",
        "altReadCount",
        "align",
        "clName",
        "tfName",
        "bad",
    ];

    @Input()
    public innerTableData: ExpSnpModel[];

    ngOnInit(): void {
        this.columnModel = {
            bad: {view: "Bad", valueConverter: v => v},
            refReadCount: {view: "Ref read counts", valueConverter: v => "" + v},
            altReadCount: {view: "Alt read counts", valueConverter: v => "" + v},
            align: {view: "GTRD align", columnTemplate: this.alignViewTemplate},
            clName: {view: "Cell line name", valueConverter: v => "" + v},
            tfName: {view: "Transcription factor name", valueConverter: v => "" + v},
        };
    }

    _getPaginatorOptions(): number[] {
        return getPaginatorOptions(this.innerTableData.length);
    }
}
