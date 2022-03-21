import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HelloComponent } from './hello/hello.component';
import { ClaimComponent } from './claim/claim.component';

const routes: Routes = [
  { path: 'alma', component: HelloComponent },
  { path: 'claim/:id', component: ClaimComponent },
  { path: '', component: HelloComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
