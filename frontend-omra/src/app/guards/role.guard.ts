import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router, private auth: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = localStorage.getItem('role');
    const requiredRoles = route.data['roles'] as string[];

    if (requiredRoles?.includes(userRole!)) return true;

    // Redirection SÛRE selon rôle existant
    const redirects: any = {
      pelerin: '/pelerin-dashboard',
      agent: '/agent-dashboard',
      admin: '/admin-dashboard'
    };

    if (userRole && redirects[userRole]) {
      this.router.navigate([redirects[userRole]]);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}
