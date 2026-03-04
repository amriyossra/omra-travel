// app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = localStorage.getItem('role');
    const requiredRoles = route.data['roles'] as Array<string>;

    if (requiredRoles && userRole && requiredRoles.includes(userRole)) {
      return true;
    } else {
      // Rediriger vers la page appropriée selon le rôle
      switch(userRole) {
        case 'pelerin':
          this.router.navigate(['/pelerin-dashboard']);
          break;
        case 'agent':
          this.router.navigate(['/agent-dashboard']);
          break;
        case 'admin':
          this.router.navigate(['/admin-dashboard']);
          break;
        default:
          this.router.navigate(['/login']);
      }
      return false;
    }
  }
}
