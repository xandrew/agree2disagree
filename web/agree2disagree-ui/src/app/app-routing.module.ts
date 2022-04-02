import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HelloComponent } from './hello/hello.component';
import { ClaimComponent } from './claim/claim.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'about', component: AboutComponent },
  { path: 'claim/:id', component: ClaimComponent },
  { path: '', component: HelloComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
