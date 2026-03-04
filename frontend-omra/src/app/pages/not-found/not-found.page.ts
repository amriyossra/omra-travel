import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  standalone: false
})
export class NotFoundPage implements OnInit {

  // Compteur pour redirection automatique (optionnel)
  countdown: number = 10;
  interval: any;

  constructor(private router: Router) { }

  ngOnInit() {
    // Optionnel: Redirection automatique après 10 secondes
    this.startCountdown();
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  startCountdown() {
    this.interval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.interval);
        this.redirectToLogin();
      }
    }, 1000);
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  // Méthode pour obtenir le message de redirection
  getRedirectMessage(): string {
    return `Vous serez redirigé vers la page de connexion dans ${this.countdown} seconde${this.countdown > 1 ? 's' : ''}.`;
  }
}
