import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage {
  email: string = '';
  password: string = '';
  role: string = 'pelerin';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    if (!this.email || !this.password) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password, this.role).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Connexion réussie !', res);

        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);
        }

        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('userId', res.user.id.toString());
          console.log('✅ User stocké:', res.user);
          console.log('✅ User ID stocké (correct):', res.user.id);
        } else {
          const tokenParts = res.token.split('|');
          if (tokenParts.length > 0) {
            localStorage.setItem('userId', tokenParts[0]);
            console.log('⚠️ User ID extrait du token:', tokenParts[0]);
          }
        }

        // ✅ REDIRECTION : pèlerin vers home, autres rôles vers leurs dashboards
        if (res.role === 'pelerin') {
          this.router.navigateByUrl('/home', { replaceUrl: true });
        } else if (res.role === 'agent') {
          this.router.navigateByUrl('/agent-dashboard', { replaceUrl: true });
        } else if (res.role === 'admin') {
          this.router.navigateByUrl('/admin-dashboard', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/home', { replaceUrl: true });
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 422 && err.error) {
          const messages = Object.values(err.error).reduce((acc: string[], curr: any) => {
            if (Array.isArray(curr)) return acc.concat(curr);
            else if (typeof curr === 'string') return acc.concat(curr);
            else return acc;
          }, []).join('\n');
          this.showError(messages);
        } else {
          this.showError(err.error?.message || 'Erreur connexion');
        }
      }
    });
  }

  selectRole(role: string) {
    this.role = role;
  }

  getLoginButtonStyle(): any {
    switch (this.role) {
      case 'pelerin':
        return { 'background': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 'color': '#fff', 'border': 'none' };
      case 'agent':
        return { 'background': 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 'color': '#fff', 'border': 'none' };
      case 'admin':
        return { 'background': 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)', 'color': '#000', 'border': 'none' };
      default:
        return {};
    }
  }

  getRegisterButtonStyle(): any {
    switch (this.role) {
      case 'pelerin':
        return { 'background': '#3b82f6', 'color': '#fff', 'border-radius': '8px' };
      case 'agent':
        return { 'background': '#10b981', 'color': '#fff', 'border-radius': '8px' };
      case 'admin':
        return { 'background': '#f59e0b', 'color': '#000', 'border-radius': '8px' };
      default:
        return {};
    }
  }

  getRoleIndicatorClass(): string {
    switch (this.role) {
      case 'pelerin': return 'pelerin-indicator';
      case 'agent': return 'agent-indicator';
      case 'admin': return 'admin-indicator';
      default: return '';
    }
  }

  getRoleIcon(): string {
    switch (this.role) {
      case 'pelerin': return 'person';
      case 'agent': return 'briefcase';
      case 'admin': return 'shield';
      default: return 'person';
    }
  }

  showError(message: string) {
    console.error(message);
    alert(message);
  }
}
