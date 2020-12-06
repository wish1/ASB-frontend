import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {ScriptService} from 'src/app/services/script.service';
import {AnnotationDataModel, StatsDataModel} from 'src/app/models/annotation.model';
import {writeScientificNum} from '../../../../functions/scientific.helper';
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'astra-ticket-stats',
    templateUrl: './ticket-stats.component.html',
    styleUrls: ['./ticket-stats.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class TicketStatsComponent implements OnInit {
    public chartDatasets: Array<any> = [];
    public stats: StatsDataModel;

    @Input()
    set chartData(value: AnnotationDataModel) {
        if (value && value.status === 'Processed') {
            this.stats = value.metaInfo;
            this.chartDatasets = [
                {
                    data:
                        [value.metaInfo.asbCount, value.metaInfo.candidatesCount, value.metaInfo.notFound],
                    label: 'All ASB'
                }
            ];
        }
    }

    public chartLabels: string[] = ['ASB SNPs', 'Non-ASB', 'Unknown'];

    public chartColors: Array<any> = [
        {
            backgroundColor: ['#4ac1c1', '#ffc463', '#B8B8B8'],
            hoverBackgroundColor: ['#51caca', '#FFC870', '#BEBEBE'],
            borderWidth: 2,
        }
    ];

    public chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false,
            position: 'bottom'
        }
    };
    public chartLoaded: boolean;

    constructor(private scriptService: ScriptService,
                private toastrService: ToastrService,
                private cd: ChangeDetectorRef) {
    }

    ngOnInit(): void {
        this.scriptService.load('charts').then(data => {
            this.chartLoaded = data.filter(v => v.script === 'charts')[0].loaded;
            this.cd.detectChanges();
        }).catch(() => this.toastrService.error(
            "Can't load Chart.js library, check your internet connection", 'Error'));
    }


    writeScientificNum(num, precision): string {
        return writeScientificNum(num, precision);
    }


    public chartClicked(): void {
    }

    public chartHovered(): void {
    }
}
