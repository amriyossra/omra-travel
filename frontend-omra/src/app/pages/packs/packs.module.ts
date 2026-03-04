import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PacksPageRoutingModule } from './packs-routing.module';
import { PacksPage } from './packs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PacksPageRoutingModule
  ],
  declarations: [PacksPage]
})
export class PacksPageModule {}
