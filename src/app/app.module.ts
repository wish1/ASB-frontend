import {NgModule} from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {StoreModule} from "@ngrx/store";
import {asbAppReducer, asbAppEffects} from "./store";
import {EffectsModule} from "@ngrx/effects";
import {StoreDevtoolsModule} from "@ngrx/store-devtools";
import {environment} from "src/environments/environment";
import {AsbAppIconsModule} from "./helpers/svgIcon";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserModule} from "@angular/platform-browser";
import {AsbRoutingModule} from "./asb-routing.module";
import {AppComponent} from "./app.component";
import {AsbHelpersModule} from "./modules/helpers/helpers.module";
import {DataService} from "./services/data.service";
import {SearchService} from "./services/search.service";
import { ToastrModule } from "ngx-toastr";
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

  ],
  providers: [
      DataService,
      SearchService,
      SeoService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
