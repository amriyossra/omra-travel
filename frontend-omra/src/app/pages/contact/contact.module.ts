import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ContactPageRoutingModule } from './contact-routing.module';
import { ContactPage } from './contact.page';
import { SharedComponentsModule } from '../../components/shared-components.module'; // ← IMPORTER

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContactPageRoutingModule,
    SharedComponentsModule // ← AJOUTER ICI
  ],
  declarations: [ContactPage]
})
export class ContactPageModule {}
