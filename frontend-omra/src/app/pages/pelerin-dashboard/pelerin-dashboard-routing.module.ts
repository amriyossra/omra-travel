import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PelerinDashboardPage } from './pelerin-dashboard.page';

const routes: Routes = [
  {
    path: '',
    component: PelerinDashboardPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PelerinDashboardPageRoutingModule {}
