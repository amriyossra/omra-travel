import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ← AJOUTER ReactiveFormsModule
import { IonicModule } from '@ionic/angular';

import { AgentDashboardPageRoutingModule } from './agent-dashboard-routing.module';
import { AgentDashboardPage } from './agent-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ← AJOUTER CETTE LIGNE
    IonicModule,
    AgentDashboardPageRoutingModule
  ],
  declarations: [AgentDashboardPage] // ← Vérifiez que votre component est déclaré ici
})
export class AgentDashboardPageModule {}
