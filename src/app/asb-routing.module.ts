import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import {HomePageComponent} from "./modules/home-page/home-page.component";
import {ContactsPageComponent} from "./modules/contacts-page/contacts-page.component";
import {PageNotFoundComponent} from "./modules/404-page/page-not-found.component";
import {SnpPageComponent} from "./modules/snp-page/snp-page.component";
import {HelpPageComponent} from "./modules/help-page/help-page.component";


const routes: Routes = [
    {
        path: "",
        component: HomePageComponent,
        data: {
            title: "ADASTra - Allelic Dosage corrected Allele-Specific human Transcription factor binding sites"
        }
    },
    {
        path: "404",
        component: PageNotFoundComponent,
        data: {
            title: "Page not found"
        }
    },
    {
        path: "contacts",
        component: ContactsPageComponent,
        data: {
            title: "ADASTra contacts page"
        }
    },
    {
        path: "help",
        component: HelpPageComponent,
        data: {
            title: "ADASTra help page"
        }
    },
    {
        path: "search",
        loadChildren: () => import(
            "./modules/search-page/search-page.module").then(mod => mod.AsbSearchPageModule),
        data: {
            title: "ADASTra - search"
        }

    },
    {
        path: "snps/:rsId/:alt",
        component: SnpPageComponent,
        data: {
            title: (id: string) => `${id} - ADASTra v1.1` // FIXME
        }
    },
    {
        path: "**",
        redirectTo: "/404"
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    initialNavigation: "enabled"
})],
  exports: [RouterModule]
})
export class AsbRoutingModule { }
