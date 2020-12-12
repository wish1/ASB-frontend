import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {SeoService} from "../../../services/seo.servise";
import {ActivatedRoute} from "@angular/router";
import {SeoModel} from "../../../models/seo.model";

@Component({
    selector: 'astra-snp-annotation-main',
    templateUrl: './snp-annotation-main.component.html',
    styleUrls: ['./snp-annotation-main.component.less'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnpAnnotationMainComponent implements OnInit {
    public steps: string[] = ['text-input', 'file-drop', 'examples', 'job'];
    text: string = 'This web service annotates a given list of SNPs with allele-specific binding events across' +
        ' a wide range of transcription factors and cell types\nusing ADASTRA that is constructed through the meta-analysis of more than 15000 ChIP-Seq experiments.';

    constructor(private seoService: SeoService, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.seoService.updateSeoInfo(this.route.snapshot.data as SeoModel);
    }
}
