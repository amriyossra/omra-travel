// src/app/pages/select-role/select-role.page.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-role',
  templateUrl: './select-role.page.html',
  styleUrls: ['./select-role.page.scss'],
  standalone:false
})
export class SelectRolePage {
  selectedRole: string = 'pelerin';

  constructor(private router: Router) {}

  selectRole(role: string) {
    this.selectedRole = role;
  }

  showRoleDetails(role: string) {
    // Optionnel : afficher plus d'infos
    console.log('Détails du rôle:', role);
  }

  continue() {
    if (this.selectedRole) {
      this.router.navigate(['/register'], { queryParams: { role: this.selectedRole } });
    }
  }

  // ✅ AJOUTEZ CETTE MÉTHODE MANQUANTE
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
