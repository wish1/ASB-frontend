import {NgModule} from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {StoreModule} from "@ngrx/store";
import {asbAppReducer, asbAppEffects} from "./store";
import {EffectsModule} from "@ngrx/effects";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {environment} from "src/environments/environment";
import {AsbHomePageModule} from "./modules/home-page/home-page.module";
import {AsbPageNotFoundModule} from "./modules/404-page/page-not-found.module";
import {AsbContactsPageModule} from "./modules/contacts-page/contacts-page.module";
import {AsbAppIconsModule} from "./helpers/svgIcon";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {AsbSearchPageModule} from "src/app/modules/search-pages/search-page.module";
import {BrowserModule} from "@angular/platform-browser";
import {AsbRoutingModule} from "./asb-routing.module";
import {AppComponent} from "./app.component";
import {AsbHelpersModule} from "./modules/helpers/helpers.module";
import {AsbSnpPageModule} from "./modules/snp-page/snp-page.module";
import {AsbHelpPageModule} from "./modules/help-page/help-page.module";
import {DataService} from "./services/data.service";
import {SearchService} from "./services/search.service";
import { ToastrModule } from "ngx-toastr";
import {AsbBrowsePageModule} from "./modules/browse-page/browse-page.module";
import {SeoService} from "./services/seo.servise";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
      BrowserModule.withServerTransition({ appId: "serverApp" }),
      BrowserAnimationsModule,
      StoreModule.forRoot(asbAppReducer),
      EffectsModule.forRoot(asbAppEffects),
      ToastrModule.forRoot(),
      environment.production ? [] : StoreDevtoolsModule.instrument(),
      MatSnackBarModule,
      AsbRoutingModule,

      AsbAppIconsModule,
      AsbHelpersModule,

      // Pages components
      AsbHomePageModule,
      AsbPageNotFoundModule,
      AsbSnpPageModule,
      AsbContactsPageModule,
      AsbSearchPageModule,
      AsbHelpPageModule,
      AsbBrowsePageModule

  ],
  providers: [
      DataService,
      SearchService,
      SeoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
