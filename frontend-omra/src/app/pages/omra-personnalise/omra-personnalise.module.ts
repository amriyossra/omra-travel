import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OmraPersonnalisePageRoutingModule } from './omra-personnalise-routing.module';
import { OmraPersonnalisePage } from './omra-personnalise.page';
import { SharedComponentsModule } from '../../components/shared-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OmraPersonnalisePageRoutingModule,
    SharedComponentsModule
  ],
  declarations: [OmraPersonnalisePage]
})
export class OmraPersonnalisePageModule {}
