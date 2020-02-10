import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Title} from "@angular/platform-browser";

@Component({
    selector: 'home-page',
    templateUrl: "./home-page.component.html",
    styleUrls: [ './home-page.component.less' ]
})
export class HomePageComponent implements OnInit {
    constructor(private route: ActivatedRoute,
                private titleService: Title) {}
    ngOnInit() {
        this.titleService.setTitle(this.route.snapshot.data.title);
    }
}
