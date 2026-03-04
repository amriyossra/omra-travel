import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register-simple',
  templateUrl: './register-simple.page.html',
  styleUrls: ['./register-simple.page.scss'],
  standalone:false
})
export class RegisterSimplePage implements OnInit {
  role: string = '';
  userType: string = '';

  userData: any = {
    prenom: '',
    nom: '',
    email: '',
    email_confirmation: '',
    telephone: '',
    password: '',
    password_confirmation: ''
  };

  isLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.role = params['role'];
        this.userData.role = params['role'];

        switch(this.role) {
          case 'admin':
            this.userType = 'Administrateur';
            break;
          case 'agent':
            this.userType = 'Agent';
            break;
        }
      }
    });
  }

  register() {
    if (this.userData.email !== this.userData.email_confirmation) {
      alert('Les emails ne correspondent pas');
      return;
    }

    if (this.userData.password !== this.userData.password_confirmation) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    this.isLoading = true;

    // Simulation d'inscription
    setTimeout(() => {
      this.isLoading = false;
      alert(`Compte ${this.userType} créé avec succès !`);
      this.router.navigate(['/login']);
    }, 2000);
  }
}
