import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import * as fromActions from 'src/app/store/action/ananastra';
import * as fromSelectors from 'src/app/store/selector/ananastra';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {AnnotationDataModel, AnnotationSnpModel, PingDataModel} from 'src/app/models/annotation.model';
import {MatTabGroup} from '@angular/material/tabs';
import {TfOrCl} from '../../../models/data.model';
import {DownloadService} from 'src/app/services/download.service';
import {FileSaverService} from 'ngx-filesaver';
import {AnnotationStoreState} from "../../../store/reducer/ananastra";
import {ReleaseModel} from "../../../models/releases.model";
import {recentRelease} from "../../../helpers/constants/releases";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Clipboard} from "@angular/cdk/clipboard";
import {SeoService} from "../../../services/seo.servise";
import {getTextByStepNameAnanas} from "../../../helpers/text-helpers/tour.ananas.helper";

@Component({
    selector: 'astra-ticket-page',
    templateUrl: './ticket-page.component.html',
    styleUrls: ['./ticket-page.component.less', '../snp-annotation-main/snp-annotation-main.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class TicketPageComponent implements OnInit, OnDestroy {
    @ViewChild('tabGroup')
    private tabGroup: MatTabGroup;
    public ticket: string;
    private subscriptions = new Subscription();
    public fileStatistics$: Observable<{ data?: AnnotationDataModel; loading: boolean }>;
    public tfTableData$: Observable<{ data?: AnnotationSnpModel[]; loading: boolean }>;
    public clTableData$: Observable<{ data?: AnnotationSnpModel[]; loading: boolean }>;

    public tfTableDataSum$: Observable<{ data?: AnnotationSnpModel[]; loading: boolean }>;
    public clTableDataSum$: Observable<{ data?: AnnotationSnpModel[]; loading: boolean }>;

    public isExpanded = true;
    public recentRelease: ReleaseModel;
    public selectedTab: TfOrCl = 'tf';
    public timeoutId: number = null;
    public selectedName: {
        tfSum: string, tf: string, cl:  string, clSum: string,
    } = {tf: null, tfSum: null, cl: null, clSum: null};
    public pingLoading$: Observable<boolean>;
    public pingData$: Observable<PingDataModel>;
    public ticketProcessing$: Observable<boolean>;
    public steps: string[] = [
        'ticket', 'stats',
        'odds-table-open',
        'odds-table',
        'col-button',
        'pie-chart',
        'columns-select', 'download-table',
        'filter'
    ];
    public panelExpanded: boolean = false;


    constructor(private route: ActivatedRoute,
                private store: Store<AnnotationStoreState>,
                private router: Router,
                private seoService: SeoService,
                private clipboard: Clipboard,
                private _snackBar: MatSnackBar,
                private downloadService: DownloadService,
                private fileSaverService: FileSaverService) {
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    }

    ngOnInit(): void {
        this.recentRelease = recentRelease;
        this.subscriptions.add(
            this.route.paramMap.subscribe(
                s => {
                    this.ticket = s.get('id');
                }
            )
        );

        this.fileStatistics$ = this.store.select(
            fromSelectors.selectAnnotationDataById, this.ticket);
        this.pingLoading$ = this.store.select(
            fromSelectors.selectPingDataLoadingById, this.ticket);
        this.pingData$ = this.store.select(
            fromSelectors.selectPingDataById, this.ticket);
        this.store.dispatch(new fromActions.annotation.InitPingAnnotationAction(
            this.ticket));
        this.subscriptions.add(
            this.pingData$.subscribe(
                f => {
                    if (f) {
                        switch (f.status) {
                            case 'Processed':
                                this.clearInterval()
                                this.store.dispatch(new fromActions.annotation.InitAnnotationInfoStatsAction(
                                    this.ticket));
                                this.subscriptions.add(
                                    this.fileStatistics$.subscribe(
                                        s => {
                                            if (s && !s.loading && s.data) {
                                                this.selectedTab = s.data.metaInfo.tfAsbList.length == 0 && s.data.metaInfo.clAsbList.length > 0 ? 'cl' : 'tf';
                                                this.store.dispatch(new fromActions.annotation.InitAnnotationTableAction(
                                                    {tfOrCl: this.selectedTab,
                                                        ticket: this.ticket,
                                                        isExpanded: this.isExpanded}
                                                ));
                                            }
                                        }
                                    )
                                )

                                break;
                             case 'Processing':
                                 this.clearInterval()
                                 this.timeoutId = window.setTimeout(
                                     () => this.store.dispatch(new fromActions.annotation.InitPingAnnotationAction(
                                         this.ticket)), 500
                                 )
                                break;
                             case 'Created':
                                 this.store.dispatch(new fromActions.annotation.InitAnnotationStartAction(
                                     {ticket: this.ticket, fdr: '0.05'}));
                                 this.store.dispatch(new fromActions.annotation.InitPingAnnotationAction(
                                     this.ticket));
                                break;
                             case 'Failed':
                                break;

                        }
                    } else {
                        this.store.dispatch(new fromActions.annotation.InitPingAnnotationAction(
                            this.ticket));
                    }
                }
            )
        );
        this.ticketProcessing$ = this.store.select(fromSelectors.selectProcessingById, this.ticket)
        this.tfTableData$ = this.store.select(fromSelectors.selectAnnotationTfTable, this.ticket);
        this.clTableData$ = this.store.select(fromSelectors.selectAnnotationClTable, this.ticket);
        this.tfTableDataSum$ = this.store.select(fromSelectors.selectAnnotationTfTableSum, this.ticket);
        this.clTableDataSum$ = this.store.select(fromSelectors.selectAnnotationClTableSum, this.ticket);

    }

    ngOnDestroy(): void {
        this.clearInterval()
        this.subscriptions.unsubscribe();
    }
    clearInterval(): void {
        window.clearInterval(this.timeoutId)
    }

    tabIndexChanged(index: number): void {
        this.selectedTab = index === 0 ? 'tf' : 'cl';
        this.initTableLoad();
    }

    groupValueChanged(event: boolean): void {
        this.isExpanded = event;
        this.initTableLoad();
    }

    initTableLoad(): void {
        this.store.dispatch(new fromActions.annotation.InitAnnotationTableAction(
            {
                ticket: this.ticket,
                tfOrCl: this.selectedTab,
                isExpanded: this.isExpanded
            }));
    }

    downloadTable(tfOrCl: TfOrCl): void {
        this.subscriptions.add(
            this.downloadService.downloadTable(this.ticket, tfOrCl, this.isExpanded, 'tsv').subscribe(
                b => this.fileSaverService.save(b, `ananastra_${this.ticket}.tsv`)
            )
        );
    }

    getTooltip(date: string): string {
        return `This is your unique job ticked ID. You can use it to access the report on your query later upon completion.
         Your results will be available until ${date ? date : ''}. Click to copy.`
    }

    copyTicket() {
        this.clipboard.copy(this.ticket);
        this._snackBar.open('Copied to clipboard', null, {
            duration: 2000,
        });
    }

    getTextByStepName(str: string) {
        return getTextByStepNameAnanas(str)
    }
}
