import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegisterSimplePage } from './register-simple.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterSimplePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterSimplePageRoutingModule {}
