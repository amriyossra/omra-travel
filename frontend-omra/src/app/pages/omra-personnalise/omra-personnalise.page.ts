import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { DemandePersonnaliseeService, DemandePersonnaliseeData } from '../../services/demande-personnalisee';

@Component({
  selector: 'app-omra-personnalise',
  templateUrl: './omra-personnalise.page.html',
  styleUrls: ['./omra-personnalise.page.scss'],
  standalone: false
})
export class OmraPersonnalisePage implements OnInit {
  omraForm: FormGroup;
  today: string = new Date().toISOString().split('T')[0];
  isLoading = false;
  errorMessage = '';
  showConfirmation = false;

  constructor(
    private fb: FormBuilder,
    private demandeService: DemandePersonnaliseeService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router
  ) {
    this.omraForm = this.fb.group({
      nombrePersonnes: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      duree: ['', [Validators.required, Validators.min(7), Validators.max(30)]],
      dateDepart: ['', Validators.required],
      villeDepart: ['', Validators.required],
      hotelMakkah: ['standard'],
      hotelMedina: ['standard'],
      typeChambre: ['double'],
      visa: [false],
      assurance: [false],
      transport: [false],
      guide: [false],
      repas: [false],
      zamzam: [false],
      budget: ['', Validators.required],
      paiement: ['especes', Validators.required],
      demandes: ['']
    });
  }

  ngOnInit() {}

  async submitForm() {
    if (this.omraForm.invalid) {
      Object.keys(this.omraForm.controls).forEach(key => {
        this.omraForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      const alert = await this.alertCtrl.create({
        header: 'Connexion requise',
        message: 'Vous devez être connecté pour envoyer une demande.',
        buttons: [
          { text: 'Annuler', role: 'cancel' },
          { text: 'Se connecter', handler: () => this.router.navigate(['/login']) }
        ]
      });
      await alert.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Envoi de votre demande...',
      spinner: 'crescent'
    });
    await loading.present();
    this.isLoading = true;
    this.errorMessage = '';

    // Préparer les données au format attendu par l'API
    const formValue = this.omraForm.value;
    const data: DemandePersonnaliseeData = {
      nombre_personnes: formValue.nombrePersonnes,
      duree: formValue.duree,
      date_depart: formValue.dateDepart,
      ville_depart: formValue.villeDepart,
      hotel_makkah: formValue.hotelMakkah,
      hotel_medina: formValue.hotelMedina,
      type_chambre: formValue.typeChambre,
      visa: formValue.visa,
      assurance: formValue.assurance,
      transport_local: formValue.transport,
      guide_prive: formValue.guide,
      repas_inclus: formValue.repas,
      zamzam: formValue.zamzam,
      budget: formValue.budget,
      mode_paiement: formValue.paiement,
      demandes_speciales: formValue.demandes
    };

    this.demandeService.createDemande(data).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        this.showConfirmation = true;
        this.omraForm.reset({
          nombrePersonnes: '',
          duree: '',
          dateDepart: '',
          villeDepart: '',
          hotelMakkah: 'standard',
          hotelMedina: 'standard',
          typeChambre: 'double',
          visa: false,
          assurance: false,
          transport: false,
          guide: false,
          repas: false,
          zamzam: false,
          budget: '',
          paiement: 'especes',
          demandes: ''
        });
        // Cacher le message après 5 secondes
        setTimeout(() => this.showConfirmation = false, 5000);
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        console.error('Erreur:', error);
        let message = 'Une erreur est survenue. Veuillez réessayer.';
        if (error.status === 422) {
          message = 'Données invalides. Vérifiez les champs.';
        } else if (error.status === 401) {
          message = 'Votre session a expiré. Veuillez vous reconnecter.';
        }
        this.errorMessage = message;
        // Optionnel : afficher une alerte
        const alert = await this.alertCtrl.create({
          header: 'Erreur',
          message,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  resetForm() {
    this.omraForm.reset({
      nombrePersonnes: '',
      duree: '',
      dateDepart: '',
      villeDepart: '',
      hotelMakkah: 'standard',
      hotelMedina: 'standard',
      typeChambre: 'double',
      visa: false,
      assurance: false,
      transport: false,
      guide: false,
      repas: false,
      zamzam: false,
      budget: '',
      paiement: 'especes',
      demandes: ''
    });
    this.errorMessage = '';
    this.showConfirmation = false;
  }
}
