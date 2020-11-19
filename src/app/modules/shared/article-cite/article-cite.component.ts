import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'asb-article-cite',
  templateUrl: './article-cite.component.html',
  styleUrls: ['./article-cite.component.less']
})
export class ArticleCiteComponent implements OnInit {

    @Input()
    public isAbout: boolean;
    constructor() { }

    ngOnInit(): void {
    }

}
