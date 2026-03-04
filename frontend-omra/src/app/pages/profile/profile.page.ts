import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

interface User {
  civilite: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  date_naissance: string;
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;
  nationalite: string;
  role: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {
  isEditing: boolean = false;
  user: User = {
    civilite: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    adresse: '',
    code_postal: '',
    ville: '',
    pays: 'Tunisie',
    nationalite: 'Tunisienne',
    role: 'pèlerin'
  };

  constructor(
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.warn('Erreur parsing user', e);
      }
    }
  }

  enableEdit() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    this.loadUserData(); // Recharger les données originales
  }

  async updateProfile() {
    try {
      localStorage.setItem('user', JSON.stringify(this.user));
      this.isEditing = false;

      const alert = await this.alertCtrl.create({
        header: '✅ Succès',
        message: 'Votre profil a été mis à jour avec succès.',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      const alert = await this.alertCtrl.create({
        header: '❌ Erreur',
        message: 'Une erreur est survenue lors de la mise à jour.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Se déconnecter',
          handler: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            localStorage.removeItem('role');
            this.router.navigate(['/home']);
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteAccount() {
    const alert = await this.alertCtrl.create({
      header: '⚠️ Suppression de compte',
      message: 'Cette action est irréversible. Voulez-vous vraiment supprimer votre compte ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Supprimer',
          cssClass: 'text-danger',
          handler: () => {
            // Appel API pour supprimer le compte
            localStorage.clear();
            this.router.navigate(['/register']);
          }
        }
      ]
    });
    await alert.present();
  }
}
