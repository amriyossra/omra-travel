import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BlogPageRoutingModule } from './blog-routing.module';
import { BlogPage } from './blog.page';
import { SharedComponentsModule } from '../../components/shared-components.module'; // ← IMPORTER

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BlogPageRoutingModule,
    SharedComponentsModule // ← AJOUTER ICI
  ],
  declarations: [BlogPage]
})
export class BlogPageModule {}
