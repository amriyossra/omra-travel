import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { PackService } from '../../services/pack';


@Component({
  selector: 'app-packs',
  templateUrl: './packs.page.html',
  styleUrls: ['./packs.page.scss'],
  standalone:false
})
export class PacksPage implements OnInit {
  packs: any[] = [];

  constructor(
    private packService: PackService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadPacks();
  }

  loadPacks() {
    this.packService.getPacks().subscribe({
      next: (packs) => {
        this.packs = packs;
      },
      error: () => {
        this.showError('Impossible de charger les packs');
      }
    });
  }

  getServices(servicesString: string): string[] {
    if (!servicesString) return [];
    return servicesString.split('\n').filter(s => s.trim());
  }

  async reserver(pack: any) {
    // Vérifier la connexion
    const token = localStorage.getItem('token');

    if (!token) {
      const alert = await this.alertCtrl.create({
        header: 'Connexion requise',
        message: 'Connectez-vous pour réserver',
        buttons: [
          { text: 'Annuler', role: 'cancel' },
          {
            text: 'Se connecter',
            handler: () => {
              this.router.navigate(['/login']);
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    // Rediriger vers la réservation
    this.router.navigate(['/reservation', pack.id]);
  }

  async showError(message: string) {
    const alert = await this.alertCtrl.create({
      header: 'Erreur',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
