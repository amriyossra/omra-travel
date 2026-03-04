import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  role: string = 'pelerin';

  userData: any = {
    civilite: 'Monsieur',
    prenom: '',
    nom: '',
    email: '',
    email_confirmation: '',
    telephone: '',
    adresse: '',
    ville: '',
    pays: 'Tunisie',
    code_postal: '',
    region: '',
    password: '',
    password_confirmation: '',
    role: 'pelerin',
    access_code: '',  // Pour agent/admin
    agence: ''        // Pour agent seulement
  };

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Récupérer le rôle depuis les paramètres d'URL
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.role = params['role'];
        this.userData.role = params['role'];

        if (this.role === 'agent' || this.role === 'admin') {
          this.userData.civilite = 'Monsieur';
        }
      }
    });
  }

  getInputStyle(): any {
    switch(this.role) {
      case 'pelerin': return {'border-radius': '12px','height': '50px','border': '2px solid #dbeafe'};
      case 'agent': return {'border-radius': '12px','height': '50px','border': '2px solid #d1fae5'};
      case 'admin': return {'border-radius': '12px','height': '50px','border': '2px solid #fef3c7'};
      default: return {'border-radius': '12px','height': '50px','border': '2px solid #dbeafe'};
    }
  }

  getButtonStyle(): any {
    switch(this.role) {
      case 'pelerin': return {'background': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)','color': '#ffffff','border': 'none'};
      case 'agent': return {'background': 'linear-gradient(135deg, #10b981 0%, #047857 100%)','color': '#ffffff','border': 'none'};
      case 'admin': return {'background': 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)','color': '#000000','border': 'none'};
      default: return {'background': 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)','color': '#ffffff','border': 'none'};
    }
  }

  // ---------------- MÉTHODE REGISTER ----------------
  register() {
    console.log('Tentative d\'inscription:', {
      role: this.role,
      userData: this.userData
    });

    // Validation email
    if (this.userData.email !== this.userData.email_confirmation) {
      this.showError('Les emails ne correspondent pas');
      return;
    }

    // Validation mot de passe
    if (this.userData.password !== this.userData.password_confirmation) {
      this.showError('Les mots de passe ne correspondent pas');
      return;
    }

    // Validation longueur mot de passe pour agent/admin
    if ((this.role === 'agent' || this.role === 'admin') && this.userData.password.length < 12) {
      this.showError('Le mot de passe doit contenir au moins 12 caractères');
      return;
    }

    // Validation code d'accès pour agent/admin
    if ((this.role === 'agent' || this.role === 'admin') && !this.userData.access_code) {
      this.showError('Le code d\'accès est requis');
      return;
    }

    // Validation pour agent: agence requise
    if (this.role === 'agent' && !this.userData.agence) {
      this.showError('Le nom de l\'agence est requis');
      return;
    }

    // ✅ Inscription
    this.isLoading = true;

    this.authService.register(this.userData).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Inscription réussie !', res);

        // ✅ Si inscription avec connexion automatique
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role || this.role);

          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
            localStorage.setItem('userId', res.user.id.toString());
          }

          // ✅ Redirection selon le rôle
          let route = '/pelerin-dashboard';
          if (res.role === 'agent') route = '/agent-dashboard';
          else if (res.role === 'admin') route = '/admin-dashboard';

          this.router.navigate([route]);
        }
        // ✅ Si inscription sans connexion automatique
        else {
          this.showSuccessToast(
            this.role === 'pelerin'
              ? 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
              : 'Inscription réussie ! Votre compte sera activé après validation.'
          );

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showError(err.error?.message || 'Erreur inscription');
      }
    });
  }

  showError(message: string) {
    alert(message);
  }

  showSuccessToast(message: string) {
    alert(message);
  }
}
