import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello/hello.component';
import { ClaimComponent } from './claim/claim.component';
import { NewArgumentComponent } from './new-argument/new-argument.component';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatListModule } from '@angular/material/list';

import { ArgumentComponent } from './argument/argument.component';
import { NewCounterComponent } from './new-counter/new-counter.component';
import { AnoTextComponent } from './ano-text/ano-text.component';
import { ClaimSelectorComponent } from './claim-selector/claim-selector.component';
import { UserBadgeComponent } from './user-badge/user-badge.component';
import { DisagreersPanelComponent } from './disagreers-panel/disagreers-panel.component';
import { CheckCrossComponent } from './check-cross/check-cross.component';
import { AnnotationMarkerComponent } from './annotation-marker/annotation-marker.component';
import { ClaimSearchComponent } from './claim-search/claim-search.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloComponent,
    ClaimComponent,
    NewArgumentComponent,
    ArgumentComponent,
    NewCounterComponent,
    AnoTextComponent,
    ClaimSelectorComponent,
    UserBadgeComponent,
    DisagreersPanelComponent,
    CheckCrossComponent,
    AnnotationMarkerComponent,
    ClaimSearchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDialogModule,
    MatSliderModule,
    MatTooltipModule,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
