import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone:false
})
export class ForgotPasswordPage {

  email: string = '';
  step: number = 1;
  isLoading: boolean = false;

  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  async sendResetLink() {
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      const toast = await this.toastCtrl.create({
        message: 'Format d\'email invalide',
        duration: 3000,
        color: 'danger'
      });
      toast.present();
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingCtrl.create({
      message: 'Envoi en cours...',
      spinner: 'crescent'
    });
    await loading.present();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const data = {
      email: this.email.trim().toLowerCase()
    };

    this.http.post(`${this.apiUrl}/forgot-password`, data, { headers }).subscribe({
      next: async (response: any) => {
        await loading.dismiss();
        this.isLoading = false;

        if (response.success) {
          // En développement, afficher le lien
          if (response.dev_link) {
            console.log('Lien de réinitialisation (DEV):', response.dev_link);

            // Optionnel: Afficher une alerte avec le lien
            const alert = document.createElement('div');
            alert.innerHTML = `
              <div style="padding: 20px; background: #f0f9ff; border-radius: 10px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Lien de test (Développement)</h3>
                <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                  ${response.dev_link}
                </p>
                <p style="color: #666; font-size: 14px;">En production, ce lien serait envoyé par email.</p>
              </div>
            `;
            document.querySelector('.forgot-container')?.appendChild(alert);
          }

          this.step = 2; // Passer à l'étape confirmation

          const toast = await this.toastCtrl.create({
            message: 'Lien de réinitialisation envoyé !',
            duration: 4000,
            color: 'success'
          });
          toast.present();

        } else {
          const toast = await this.toastCtrl.create({
            message: response.message || 'Erreur lors de l\'envoi',
            duration: 4000,
            color: 'danger'
          });
          toast.present();
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;

        const toast = await this.toastCtrl.create({
          message: 'Erreur de connexion au serveur',
          duration: 4000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  async resendLink() {
    await this.sendResetLink();
  }
}
