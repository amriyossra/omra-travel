import { Component } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
  standalone: false
})
export class ContactPage {
  contact = {
    nom: '',
    email: '',
    sujet: '',
    message: '',
  };

  constructor(private toastCtrl: ToastController) {}

  async sendMessage() {
    if (!this.contact.nom || !this.contact.email || !this.contact.sujet || !this.contact.message) {
      this.showToast('Veuillez remplir tous les champs', 'danger');
      return;
    }

    console.log('Message envoyé :', this.contact);
    await this.showToast('Votre message a été envoyé avec succès !', 'success');

    this.contact = { nom: '', email: '', sujet: '', message: '' };
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' });
    await toast.present();
  }
}
