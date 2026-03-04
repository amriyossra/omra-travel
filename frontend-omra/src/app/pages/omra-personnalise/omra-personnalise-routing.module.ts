import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OmraPersonnalisePage } from './omra-personnalise.page';

const routes: Routes = [
  {
    path: '',
    component: OmraPersonnalisePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OmraPersonnalisePageRoutingModule {}
