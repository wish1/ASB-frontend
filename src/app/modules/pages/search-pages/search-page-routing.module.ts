import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {SearchPageComponent} from "./search-page.component";

const routes: Routes = [
    {
        path: "simple",
        component: SearchPageComponent
    },
    {
        path: "advanced",
        component: SearchPageComponent
    },
    {
        path: "",
        pathMatch: 'full',
        redirectTo: 'simple'
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AsbSearchPageRoutingModule { }