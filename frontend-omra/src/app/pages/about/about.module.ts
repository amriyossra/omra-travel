import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AboutPageRoutingModule } from './about-routing.module';
import { AboutPage } from './about.page';
import { SharedComponentsModule } from '../../components/shared-components.module'; // ← IMPORTER

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AboutPageRoutingModule,
    SharedComponentsModule // ← AJOUTER ICI
  ],
  declarations: [AboutPage]
})
export class AboutPageModule {}
