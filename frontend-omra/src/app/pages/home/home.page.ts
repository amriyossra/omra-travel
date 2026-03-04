import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { PackService } from '../../services/pack';
import { DocumentService } from '../../services/document';
import { ReservationService, ReservationData } from '../../services/reservation';

interface UploadedFile {
  file: File;
  type: string;
  progress: number;
  uploaded: boolean;
  error?: string;
  documentId?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone:false
})
export class HomePage implements OnInit {
  // ============ PACKS ============
  packs: any[] = [];
  filteredPacks: any[] = [];
  loading: boolean = false;
  errorMessage: string = '';
  searchQuery: string = '';
  typeFilter: string = 'tous';
  sortBy: string = 'date';

  // ============ MODAL DE RÉSERVATION ============
  selectedPack: any = null;
  showReservationModal: boolean = false;
  reservationForm: FormGroup;
  today: string = new Date().toISOString().split('T')[0];

  // ============ UPLOAD DE FICHIERS ============
  uploadedFiles: { [key: string]: UploadedFile } = {};
  uploadErrors: { [key: string]: string } = {};
  uploadProgress: { [key: string]: number } = {};
  currentReservationId: number | null = null;

  // ============ OPTIONS DU FORMULAIRE ============
  typeChambreOptions = [
    { value: 'quadruple', label: 'Chambre Quadruple', multiplicateur: 0.8 },
    { value: 'triple', label: 'Chambre Triple', multiplicateur: 0.9 },
    { value: 'double', label: 'Chambre Double', multiplicateur: 1.0 },
    { value: 'simple', label: 'Chambre Individuelle', multiplicateur: 1.2 }
  ];

  regimeOptions = [
    { value: 'normal', label: 'Standard' },
    { value: 'vegetarien', label: 'Végétarien' },
    { value: 'sans_gluten', label: 'Sans gluten' },
    { value: 'diabetique', label: 'Diabétique' },
    { value: 'autre', label: 'Autre' }
  ];

  nationalites = ['Tunisienne', 'Française', 'Algérienne', 'Marocaine', 'Libyenne', 'Autre'];

  documentsRequired = [
    { type: 'passeport', label: 'Passeport', required: true, accept: '.pdf,.jpg,.jpeg,.png', maxSize: 5 * 1024 * 1024 },
    { type: 'visa', label: 'Visa', required: true, accept: '.pdf,.jpg,.jpeg,.png', maxSize: 5 * 1024 * 1024 },
    { type: 'photo', label: "Photo d'identité", required: true, accept: '.jpg,.jpeg,.png', maxSize: 2 * 1024 * 1024 }
  ];

  constructor(
    private router: Router,
    private packService: PackService,
    private documentService: DocumentService,
    private reservationService: ReservationService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    // Initialisation du formulaire de réservation
    this.reservationForm = this.fb.group({
      // Informations personnelles
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      date_naissance: ['', Validators.required],
      lieu_naissance: ['', Validators.required],
      nationalite: ['', Validators.required],

      // Passeport
      passeport_numero: ['', Validators.required],
      passeport_expiration: ['', Validators.required],

      // Adresse
      adresse: ['', Validators.required],
      code_postal: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      ville: ['', Validators.required],
      pays: ['', Validators.required],

      // Détails réservation
      nombre_personnes: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      nombre_chambres: [1, [Validators.required, Validators.min(1)]],
      type_chambre: ['double', Validators.required],

      // Options
      assurance: [false],
      visa: [false],
      transport_local: [true],
      guide_prive: [false],

      // Préférences alimentaires
      regime_alimentaire: ['normal'],
      regime_alimentaire_autre: [''],

      // Santé
      probleme_sante: [false],
      informations_medicales: [''],

      // Paiement
      mode_paiement: ['especes', Validators.required],
      acompte: [200, [Validators.required, Validators.min(0)]],

      // Notes
      notes_pelerin: ['']
    });

    // Gestion conditionnelle du champ "autre" pour régime alimentaire
    this.reservationForm.get('regime_alimentaire')?.valueChanges.subscribe(value => {
      const autreField = this.reservationForm.get('regime_alimentaire_autre');
      if (value === 'autre') {
        autreField?.setValidators([Validators.required]);
      } else {
        autreField?.clearValidators();
      }
      autreField?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.loadPacks();
    this.prefillUserData();
  }

  // ============ CHARGEMENT DES PACKS ============
  loadPacks() {
    this.loading = true;
    this.errorMessage = '';

    this.packService.getPublicPacks().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.packs = res.data;
          this.filteredPacks = [...this.packs];
          this.sortPacks();
        } else {
          this.errorMessage = 'Impossible de récupérer les formules Omra';
        }
        this.loading = false;
      },
      error: () => {
        this.loadDemoPacks();
        this.loading = false;
      }
    });
  }

  // ============ DONNÉES DE DÉMONSTRATION ============
  private loadDemoPacks() {
    this.packs = [
      {
        id: 1,
        titre: 'Pack Économique',
        type: 'économique',
        prix: 3900,
        duree: 11,
        description: 'Pack économique pour vivre une Omra spirituelle à petit prix'
      },
      {
        id: 2,
        titre: 'Pack Confort',
        type: 'confort',
        prix: 4500,
        duree: 12,
        description: 'Pack confort avec hébergement de qualité'
      },
      {
        id: 3,
        titre: 'Pack Ramadan',
        type: 'ramadan',
        prix: 7000,
        duree: 15,
        description: 'Pack spécial Ramadan pour vivre les nuits bénies'
      },
      {
        id: 4,
        titre: 'Pack Premium',
        type: 'premium',
        prix: 8200,
        duree: 14,
        description: 'Pack premium avec services VIP et hébergement luxe'
      }
    ];
    this.filteredPacks = [...this.packs];
    this.sortPacks();
  }

  // ============ FILTRES ET TRI ============
  filterPacks() {
    let filtered = [...this.packs];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.titre.toLowerCase().includes(query) ||
        p.type?.toLowerCase().includes(query)
      );
    }

    if (this.typeFilter !== 'tous') {
      filtered = filtered.filter(p => p.type === this.typeFilter);
    }

    this.filteredPacks = filtered;
    this.sortPacks();
  }

  sortPacks() {
    switch (this.sortBy) {
      case 'prix-asc':
        this.filteredPacks.sort((a, b) => a.prix - b.prix);
        break;
      case 'prix-desc':
        this.filteredPacks.sort((a, b) => b.prix - a.prix);
        break;
      case 'duree':
        this.filteredPacks.sort((a, b) => b.duree - a.duree);
        break;
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.typeFilter = 'tous';
    this.sortBy = 'date';
    this.filteredPacks = [...this.packs];
  }

  // ============ STATISTIQUES ============
  getActivePacksCount(): number {
    return this.packs.length;
  }

  getStartingPrice(): number {
    if (this.packs.length === 0) return 0;
    return Math.min(...this.packs.map(p => p.prix));
  }

  // ============ PRÉ-REMPLISSAGE DES DONNÉES UTILISATEUR ============
  prefillUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.reservationForm.patchValue({
          nom: user.nom || user.name || '',
          prenom: user.prenom || user.firstName || '',
          email: user.email || '',
          telephone: user.telephone || '',
          adresse: user.adresse || '',
          code_postal: user.code_postal || '',
          ville: user.ville || '',
          pays: user.pays || 'Tunisie',
          nationalite: user.nationalite || 'Tunisienne',
        });
      } catch (e) {
        console.warn('Erreur parsing user data', e);
      }
    }
  }

  // ============ GESTION DU MODAL DE RÉSERVATION ============
  openReservationForm(pack: any, event?: Event) {
    if (event) event.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      this.promptLogin();
      return;
    }

    this.selectedPack = pack;
    this.showReservationModal = true;
    this.resetForm();
    this.resetUploads();
    this.prefillUserData();

    const personnes = this.reservationForm.get('nombre_personnes')?.value || 1;
    this.reservationForm.patchValue({
      nombre_chambres: Math.ceil(personnes / 2)
    });
  }

  closeReservationModal() {
    this.showReservationModal = false;
    this.selectedPack = null;
    this.resetUploads();
  }

  async promptLogin() {
    const alert = await this.alertCtrl.create({
      header: 'Connexion requise',
      message: 'Vous devez être connecté pour effectuer une réservation.',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Se connecter', handler: () => this.router.navigate(['/login']) }
      ]
    });
    await alert.present();
  }

  // ============ MÉTHODES POUR UPLOAD ============
  resetUploads() {
    this.uploadedFiles = {};
    this.uploadProgress = {};
    this.uploadErrors = {};
    this.currentReservationId = null;
  }

  resetDocument(type: string) {
    delete this.uploadedFiles[type];
    delete this.uploadProgress[type];
    delete this.uploadErrors[type];
  }

  getDocumentIcon(type: string): string {
    switch(type) {
      case 'passeport': return 'id-card-outline';
      case 'photo': return 'camera-outline';
      case 'visa': return 'document-attach-outline';
      default: return 'document-outline';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatAccept(accept: string): string {
    return accept.split(',').map(ext => ext.replace('.', '').toUpperCase()).join(', ');
  }

  onFileSelected(event: any, documentType: string) {
    const file = event.target.files[0];
    if (!file) return;

    const docConfig = this.documentsRequired.find(d => d.type === documentType);
    if (!docConfig) return;

    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    const acceptedTypes = docConfig.accept.split(',');
    const isAccepted = acceptedTypes.some(type => type.trim().toLowerCase() === fileExt);

    if (!isAccepted) {
      this.uploadErrors[documentType] = `Format non supporté. Formats acceptés: ${docConfig.accept}`;
      event.target.value = '';
      return;
    }

    if (file.size > docConfig.maxSize) {
      this.uploadErrors[documentType] = `Fichier trop volumineux. Maximum: ${docConfig.maxSize / (1024 * 1024)}MB`;
      event.target.value = '';
      return;
    }

    delete this.uploadErrors[documentType];

    this.uploadedFiles[documentType] = {
      file: file,
      type: documentType,
      progress: 0,
      uploaded: false
    };

    this.uploadProgress[documentType] = 0;
    const interval = setInterval(() => {
      if (this.uploadProgress[documentType] < 100) {
        this.uploadProgress[documentType] += 10;
      } else {
        clearInterval(interval);
        this.uploadedFiles[documentType].uploaded = true;
      }
    }, 100);
  }

  allRequiredDocumentsUploaded(): boolean {
    const required = this.documentsRequired.filter(d => d.required);
    return required.every(doc => this.uploadedFiles[doc.type]?.uploaded === true);
  }

  async uploadDocuments(reservationId: number): Promise<boolean> {
    const uploadPromises = [];

    for (const [type, fileData] of Object.entries(this.uploadedFiles)) {
      if (fileData.uploaded) {
        const promise = this.documentService.uploadDocument(reservationId, type, fileData.file).toPromise();
        uploadPromises.push(promise);
      }
    }

    if (uploadPromises.length > 0) {
      try {
        await Promise.all(uploadPromises);
        console.log('✅ Tous les documents ont été uploadés avec succès');
        return true;
      } catch (error) {
        console.error('❌ Erreur lors de l\'upload des documents:', error);
        return false;
      }
    }
    return true;
  }

  // ============ SOUMISSION DU FORMULAIRE ============
  async submitReservation() {
    // 1️⃣ Marquer tous les champs comme touchés
    Object.keys(this.reservationForm.controls).forEach(key => {
      this.reservationForm.get(key)?.markAsTouched();
    });

    // 2️⃣ Vérifier si le formulaire est valide
    if (this.reservationForm.invalid) {
      const alert = await this.alertCtrl.create({
        header: '❌ Formulaire incomplet',
        message: 'Veuillez remplir tous les champs obligatoires correctement.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // 3️⃣ Vérifier les documents requis
    if (!this.allRequiredDocumentsUploaded()) {
      const alert = await this.alertCtrl.create({
        header: '📎 Documents manquants',
        message: 'Veuillez uploader tous les documents requis (Passeport, Visa et Photo d\'identité).',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // 4️⃣ Vérifier le token
    const token = localStorage.getItem('token');
    if (!token) {
      this.promptLogin();
      return;
    }

    // 5️⃣ Afficher le loader
    const loading = await this.loadingCtrl.create({
      message: 'Enregistrement de votre réservation...',
      spinner: 'crescent'
    });
    await loading.present();

    // 6️⃣ Calculer le prix total
    const prixTotal = this.calculateTotal();
    const acompte = this.reservationForm.value.acompte || 0;

    // 7️⃣ Préparer les données pour l'API
    const reservationData: ReservationData = {
      pack_id: this.selectedPack.id,
      nom: this.reservationForm.value.nom,
      prenom: this.reservationForm.value.prenom,
      email: this.reservationForm.value.email,
      telephone: this.reservationForm.value.telephone,
      date_naissance: this.reservationForm.value.date_naissance,
      lieu_naissance: this.reservationForm.value.lieu_naissance,
      nationalite: this.reservationForm.value.nationalite,
      passeport_numero: this.reservationForm.value.passeport_numero.toUpperCase(),
      passeport_expiration: this.reservationForm.value.passeport_expiration,
      adresse: this.reservationForm.value.adresse,
      code_postal: this.reservationForm.value.code_postal,
      ville: this.reservationForm.value.ville,
      pays: this.reservationForm.value.pays,
      nombre_personnes: this.reservationForm.value.nombre_personnes,
      nombre_chambres: this.reservationForm.value.nombre_chambres,
      assurance: this.reservationForm.value.assurance || false,
      visa: this.reservationForm.value.visa || false,
      transport_local: this.reservationForm.value.transport_local || true,
      guide_prive: this.reservationForm.value.guide_prive || false,
      type_chambre: this.reservationForm.value.type_chambre,
      regime_alimentaire: this.reservationForm.value.regime_alimentaire,
      regime_alimentaire_autre: this.reservationForm.value.regime_alimentaire === 'autre'
        ? this.reservationForm.value.regime_alimentaire_autre
        : '',
      probleme_sante: this.reservationForm.value.probleme_sante || false,
      informations_medicales: this.reservationForm.value.probleme_sante
        ? this.reservationForm.value.informations_medicales
        : '',
      prix_total: prixTotal,
      acompte: acompte,
      mode_paiement: this.reservationForm.value.mode_paiement,
      notes_pelerin: this.reservationForm.value.notes_pelerin || '',
      statut_paiement: acompte > 0 ? 'partiel' : 'en_attente',
      statut: 'en_attente',
      code_reservation: 'OMRA-' + new Date().getTime().toString().slice(-8)
    };

    console.log('📦 Données envoyées à l\'API:', reservationData);

    // 8️⃣ Envoyer à l'API
    this.reservationService.createReservation(reservationData).subscribe({
      next: async (response: any) => {
        console.log('✅ Réponse API:', response);

        if (response.success) {
          const reservationId = response.data?.id;

          // 9️⃣ Uploader les documents si l'ID de réservation est reçu
          if (reservationId) {
            const uploadSuccess = await this.uploadDocuments(reservationId);
            if (!uploadSuccess) {
              console.warn('⚠️ Réservation créée mais certains documents n\'ont pas pu être uploadés');
            }
          }

          await loading.dismiss();

          // 🔟 Afficher l'alerte de succès
          const alert = await this.alertCtrl.create({
            header: '✅ Réservation confirmée !',
            message: `
              Votre réservation a été enregistrée avec succès.

              📋 Référence : ${response.data?.code_reservation || reservationData.code_reservation}

              Un agent vous contactera dans les plus brefs délais pour confirmer votre voyage.
            `,
            buttons: [{
              text: 'Voir mes réservations',
              handler: () => {
                this.closeReservationModal();
                this.router.navigate(['/pelerin-dashboard']);
              }
            }, {
              text: 'Continuer',
              handler: () => {
                this.closeReservationModal();
              }
            }]
          });
          await alert.present();

          // Réinitialiser le formulaire
          this.resetForm();
          this.resetUploads();

        } else {
          await loading.dismiss();
          const alert = await this.alertCtrl.create({
            header: '❌ Erreur',
            message: response.message || 'Une erreur est survenue lors de l\'enregistrement.',
            buttons: ['OK']
          });
          await alert.present();
        }
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('❌ Erreur API:', error);

        let errorMessage = 'Impossible de communiquer avec le serveur.';

        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        if (error.status === 422 && error.error?.errors) {
          const errors = error.error.errors;
          errorMessage = 'Erreurs de validation:\n';
          Object.keys(errors).forEach(key => {
            errorMessage += `- ${errors[key].join(', ')}\n`;
          });
        } else if (error.status === 401) {
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          setTimeout(() => {
            this.logout();
          }, 2000);
        } else if (error.status === 0) {
          errorMessage = 'Impossible de joindre le serveur. Vérifiez votre connexion.';
        }

        const alert = await this.alertCtrl.create({
          header: '❌ Erreur',
          message: errorMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  // ============ MÉTHODES DE CALCUL ============
  calculateTotal(): number {
    const typeChambre = this.reservationForm.get('type_chambre')?.value || 'double';
    const nombrePersonnes = this.reservationForm.get('nombre_personnes')?.value || 1;

    if (!this.selectedPack) return 0;

    const option = this.typeChambreOptions.find(opt => opt.value === typeChambre);
    const multiplicateur = option?.multiplicateur || 1;

    return this.selectedPack.prix * multiplicateur * nombrePersonnes;
  }

  onNombrePersonnesChange() {
    const personnes = this.reservationForm.get('nombre_personnes')?.value || 1;
    const chambres = Math.max(1, Math.ceil(personnes / 2));
    this.reservationForm.patchValue({
      nombre_chambres: chambres
    });
  }

  getTypeChambreLabel(type: string): string {
    const option = this.typeChambreOptions.find(opt => opt.value === type);
    return option?.label || type;
  }

  resetForm() {
    this.reservationForm.reset({
      nombre_personnes: 1,
      nombre_chambres: 1,
      type_chambre: 'double',
      assurance: false,
      visa: false,
      transport_local: true,
      guide_prive: false,
      regime_alimentaire: 'normal',
      regime_alimentaire_autre: '',
      probleme_sante: false,
      informations_medicales: '',
      acompte: 200,
      mode_paiement: 'especes',
      notes_pelerin: ''
    });
  }

  // ============ DÉCONNEXION ============
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    this.router.navigate(['/home']);
  }
}
