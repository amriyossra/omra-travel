// app/pages/pelerin-dashboard/pelerin-dashboard.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ← AJOUTER ReactiveFormsModule
import { PelerinDashboardPageRoutingModule } from './pelerin-dashboard-routing.module';
import { PelerinDashboardPage } from './pelerin-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PelerinDashboardPageRoutingModule
  ],
  declarations: [PelerinDashboardPage]
})
export class PelerinDashboardPageModule {}
