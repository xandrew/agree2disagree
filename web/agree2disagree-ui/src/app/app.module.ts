import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';

import { UserModule } from './user/user.module';

import { AppComponent } from './app.component';
import { HelloComponent } from './hello/hello.component';
import { NewClaimComponent } from './new-claim/new-claim.component';
import { ClaimComponent } from './claim/claim.component';
import { NewArgumentComponent } from './new-argument/new-argument.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ArgumentComponent } from './argument/argument.component';
import { NewCounterComponent } from './new-counter/new-counter.component';
import { AnoTextComponent } from './ano-text/ano-text.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloComponent,
    NewClaimComponent,
    ClaimComponent,
    NewArgumentComponent,
    ArgumentComponent,
    NewCounterComponent,
    AnoTextComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatSlideToggleModule,
    UserModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
