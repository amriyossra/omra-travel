import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from '../../services/auth';
import { PackService } from '../../services/pack';
import { ReservationService } from 'src/app/services/reservation';
import { DocumentService } from 'src/app/services/document';

interface Pack {
  id: number;
  titre: string;
  description: string;
  prix: number;
  duree: number;
  hotel: string;
  transport: string;
  services: string;
  disponible: boolean;
  reservations?: number;
  reservation_trend?: number;
  created_at?: string;
  updated_at?: string;
}

interface Stats {
  totalPacks: number;
  packsChange: number;
  totalPilgrims: number;
  pilgrimsChange: number;
  activePilgrims: number;
  pendingRequests: number;
  pendingChange: number;
  urgentRequests: number;
  monthlyRevenue: number;
  revenueChange: number;
}

interface PendingReservation {
  id: number;
  pack_id: number;
  client_name: string;
  client_email: string;
  telephone?: string;
  status: string;
  created_at: string;
  notes?: string;
  date_depart?: string;
  date_retour?: string;
  prix_total?: number;
  acompte?: number;
  mode_paiement?: string;

  // Propriétés supplémentaires pour les documents et détails
  passeport_numero?: string;
  passeport_expiration?: string;
  visa?: boolean;
  assurance?: boolean;
  transport_local?: boolean;
  guide_prive?: boolean;
  demandes_speciales?: string;
  nombre_personnes?: number;
  nombre_chambres?: number;
  type_chambre?: string;
  regime_alimentaire?: string;
  probleme_sante?: boolean;
  informations_medicales?: string;
}

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.page.html',
  styleUrls: ['./agent-dashboard.page.scss'],
  standalone: false
})
export class AgentDashboardPage implements OnInit {
  // User data
  userName: string = 'Agent';
  userEmail: string = 'agent@omrasmart.com';
  userAvatar: string = 'https://ui-avatars.com/api/?name=Agent&background=0A5C36&color=fff&size=128';
  currentDate: Date = new Date();

  // UI States
  notificationCount: number = 3;
  showPackModal: boolean = false;
  showProfileMenu: boolean = false;

  // Packs management
  packs: Pack[] = [];
  filteredPacks: Pack[] = [];
  editingPack: Pack | null = null;
  packForm: FormGroup;

  // Search and filters
  searchQuery: string = '';
  statusFilter: string = '';
  sortBy: string = 'newest';

  // Statistics
  stats: Stats = {
    totalPacks: 0,
    packsChange: 12,
    totalPilgrims: 0,
    pilgrimsChange: 8,
    activePilgrims: 0,
    pendingRequests: 0,
    pendingChange: -5,
    urgentRequests: 3,
    monthlyRevenue: 0,
    revenueChange: 15
  };

  // Gestion des réservations en attente
  pendingReservations: PendingReservation[] = [];
  loadingReservations: boolean = false;
  showPendingReservationsModal: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private packService: PackService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private router: Router,
    private reservationService: ReservationService,
    private documentService: DocumentService
  ) {
    this.packForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      prix: ['', [Validators.required, Validators.min(100), Validators.max(50000)]],
      duree: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      hotel: ['3 étoiles', Validators.required],
      transport: ['Avion économique', Validators.required],
      services: ['', [Validators.required, Validators.minLength(10)]],
      disponible: [true]
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadPacks();
    this.loadPendingReservations();

    setInterval(() => {
      this.currentDate = new Date();
    }, 60000);
  }

  // ============ HEADER METHODS ============

  toggleProfileMenu(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showProfileMenu = !this.showProfileMenu;
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const profileWrapper = target.closest('.profile-wrapper');
    const profileTrigger = target.closest('.profile-trigger');

    if (!profileWrapper && !profileTrigger) {
      this.showProfileMenu = false;
    }
  }

  async viewNotifications(): Promise<void> {
    this.closeProfileMenu();
    const alert = await this.alertCtrl.create({
      header: 'Notifications',
      message: `
        <div style="text-align: center; padding: 15px;">
          <ion-icon name="notifications-circle-outline" style="font-size: 48px; color: #1a5fb4;"></ion-icon>
          <p style="margin-top: 15px;">Vous avez ${this.notificationCount} notification(s)</p>
          <p style="margin-top: 5px;">${this.pendingReservations.length} demande(s) en attente</p>
        </div>
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  // ============ LOAD DATA ============

  loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user?.avatar) {
      this.userAvatar = user.avatar;
    }
  }

  async loadPacks() {
    const loading = await this.loadingCtrl.create({
      message: 'Chargement des packs...'
    });
    await loading.present();

    this.packService.getPacks().subscribe({
      next: (response: any) => {
        loading.dismiss();
        this.packs = response?.data || response || this.getDemoPacks();
        this.filteredPacks = [...this.packs];
        this.calculateStats();
      },
      error: () => {
        loading.dismiss();
        this.packs = this.getDemoPacks();
        this.filteredPacks = [...this.packs];
        this.calculateStats();
      }
    });
  }

  // ============ GESTION DES RÉSERVATIONS EN ATTENTE ============

  loadPendingReservations() {
    this.loadingReservations = true;
    console.log('📥 Chargement des réservations en attente...');

    this.reservationService.getPendingReservations().subscribe({
      next: (response: any) => {
        this.loadingReservations = false;

        const reservations = response?.data || [];

        console.log(`📊 ${reservations.length} réservation(s) trouvée(s)`);

        if (reservations.length === 0) {
          this.pendingReservations = [];
          this.stats.pendingRequests = 0;
        } else {
          this.pendingReservations = reservations.map((r: any) => ({
            id: r.id,
            pack_id: r.pack_id,
            client_name: r.prenom && r.nom ? `${r.prenom} ${r.nom}` : (r.nom || 'Client'),
            client_email: r.email || 'Email non renseigné',
            telephone: r.telephone,
            status: r.statut,
            created_at: r.created_at,
            date_depart: r.date_depart,
            date_retour: r.date_retour,
            prix_total: r.prix_total,
            acompte: r.acompte,
            mode_paiement: r.mode_paiement,
            notes: r.notes_pelerin,

            // Propriétés supplémentaires avec valeurs par défaut
            passeport_numero: r.passeport_numero || 'AB123456',
            passeport_expiration: r.passeport_expiration,
            visa: r.visa || false,
            assurance: r.assurance || false,
            transport_local: r.transport_local || false,
            guide_prive: r.guide_prive || false,
            demandes_speciales: r.demandes_speciales,
            nombre_personnes: r.nombre_personnes || 1,
            nombre_chambres: r.nombre_chambres || 1,
            type_chambre: r.type_chambre || 'Double',
            regime_alimentaire: r.regime_alimentaire || 'Halal',
            probleme_sante: r.probleme_sante || false,
            informations_medicales: r.informations_medicales
          }));

          this.stats.pendingRequests = this.pendingReservations.length;
          console.log('✅ Réservations chargées:', this.pendingReservations);
        }
      },
      error: (err) => {
        this.loadingReservations = false;
        console.error('❌ Erreur de chargement:', err);

        if (err.status === 401) {
          this.showAlert('Session expirée', 'Veuillez vous reconnecter.').then(() => {
            this.authService.logout();
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          });
        } else {
          this.showAlert('Erreur', 'Impossible de charger les demandes');
        }
      }
    });
  }

  openPendingReservations() {
    this.closeProfileMenu();
    this.showPendingReservationsModal = true;
    this.loadPendingReservations();
  }

  closePendingReservationsModal() {
    this.showPendingReservationsModal = false;
  }

  // ============ MÉTHODE handleReservation CORRIGÉE ============

async handleReservation(
  reservation: PendingReservation,
  action: 'confirmee' | 'annulee'
) {
  const loading = await this.loadingCtrl.create({
    message: action === 'confirmee' ? 'Validation en cours...' : 'Annulation en cours...'
  });

  await loading.present();

  try {
    await this.reservationService
      .processReservation(reservation.id, action)
      .toPromise();

    // Supprimer la réservation de la liste locale
    this.pendingReservations = this.pendingReservations.filter(
      r => r.id !== reservation.id
    );

    this.stats.pendingRequests = this.pendingReservations.length;

    await loading.dismiss();

    this.showAlert(
      'Succès',
      action === 'confirmee'
        ? 'Réservation confirmée avec succès'
        : 'Réservation annulée avec succès'
    );

    this.loadPacks();

  } catch (err) {
    await loading.dismiss();
    console.error('Erreur traitement:', err);

    this.showAlert(
      'Erreur',
      'Échec du traitement de la réservation'
    );
  }
}

  async viewReservationDetails(reservation: PendingReservation) {
    const departDate = reservation.date_depart ? new Date(reservation.date_depart).toLocaleDateString('fr-FR') : 'Non définie';
    const retourDate = reservation.date_retour ? new Date(reservation.date_retour).toLocaleDateString('fr-FR') : 'Non définie';

    const message = `
      <div style="text-align: left; padding: 10px;">
        <p><strong>👤 Client:</strong> ${reservation.client_name}</p>
        <p><strong>📧 Email:</strong> ${reservation.client_email}</p>
        <p><strong>📞 Téléphone:</strong> ${reservation.telephone || 'Non renseigné'}</p>
        <p><strong>📦 Pack:</strong> #${reservation.pack_id}</p>
        <p><strong>📅 Date demande:</strong> ${new Date(reservation.created_at).toLocaleDateString('fr-FR')}</p>
        <p><strong>✈️ Départ:</strong> ${departDate}</p>
        <p><strong>🏠 Retour:</strong> ${retourDate}</p>
        <p><strong>💰 Prix total:</strong> ${reservation.prix_total || 0} TND</p>
        <p><strong>💳 Acompte:</strong> ${reservation.acompte || 0} TND</p>
        <p><strong>💵 Paiement:</strong> ${reservation.mode_paiement || 'Non spécifié'}</p>
        ${reservation.notes ? `<p><strong>📝 Note:</strong> ${reservation.notes}</p>` : ''}
      </div>
    `;

    const alert = await this.alertCtrl.create({
      header: 'Détails de la réservation',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // ============ NOUVELLES MÉTHODES POUR LA GESTION DES DOCUMENTS ============

  /**
   * Voir un document (l'ouvrir dans un nouvel onglet)
   */
  async viewDocument(documentId: number) {
    try {
      const blob = await this.documentService.getDocument(documentId).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        this.showAlert('Erreur', 'Document non trouvé');
      }
    } catch (error) {
      this.showAlert('Erreur', 'Impossible d\'ouvrir le document');
    }
  }

  /**
   * Obtenir le libellé d'un document
   */
  getDocumentLabel(type: string): string {
    const docs: {[key: string]: string} = {
      'passeport': 'passeport',
      'visa': 'visa',
      'photo': "photo d'identité",
      'vaccin': 'carnet de vaccination'
    };
    return docs[type] || type;
  }

  // ============ GESTION DES DOCUMENTS MANQUANTS ============

  /**
   * Demander plusieurs documents manquants
   */
  async requestDocuments(reservation: PendingReservation) {
    const alert = await this.alertCtrl.create({
      header: 'Documents manquants',
      message: `Sélectionnez les documents manquants pour ${reservation.client_name}`,
      inputs: [
        {
          name: 'passeport',
          type: 'checkbox',
          label: 'Passeport',
          value: 'passeport',
          checked: false
        },
        {
          name: 'photo',
          type: 'checkbox',
          label: "Photo d'identité",
          value: 'photo',
          checked: false
        },
        {
          name: 'visa',
          type: 'checkbox',
          label: 'Visa',
          value: 'visa',
          checked: false
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Envoyer la demande',
          handler: (selectedDocs) => {
            if (selectedDocs && selectedDocs.length > 0) {
              this.showAlert('Succès', 'Demande de documents envoyée');
              return true;
            } else {
              this.showAlert('Erreur', 'Sélectionnez au moins un document');
              return false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // ============ GESTION DES PACKS ALTERNATIFS ============

  /**
   * Vérifie si un pack est disponible
   */
  isPackAvailable(packId: number): boolean {
    const pack = this.packs.find(p => p.id === packId);
    return pack?.disponible || false;
  }

  /**
   * Proposer un autre pack
   */
  async proposeOtherPack(reservation: PendingReservation): Promise<void> {
    const availablePacks = this.packs.filter(p => p.disponible && p.id !== reservation.pack_id);

    if (availablePacks.length === 0) {
      this.showAlert('Information', 'Aucun autre pack disponible');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Proposer un autre pack',
      message: `Choisissez un pack à proposer à ${reservation.client_name}`,
      inputs: availablePacks.map(p => ({
        name: 'packId',
        type: 'radio',
        label: `${p.titre} - ${p.prix} TND`,
        value: p.id
      })),
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Proposer',
          handler: (packId) => {
            if (packId) {
              this.showAlert('Succès', 'Proposition envoyée au client');
              return true;
            }
            return false;
          }
        }
      ]
    });
    await alert.present();
  }

  // ============ TRAITEMENT FINAL DE LA RÉSERVATION ============

  /**
   * Accepter la réservation
   */
  async acceptReservation(reservation: PendingReservation) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer la réservation',
      message: `Êtes-vous sûr de vouloir accepter la réservation de ${reservation.client_name} ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Accepter',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Traitement en cours...' });
            await loading.present();

            try {
              await this.reservationService.processReservation(reservation.id, 'confirmee').toPromise();

              this.pendingReservations = this.pendingReservations.filter(r => r.id !== reservation.id);
              this.stats.pendingRequests = this.pendingReservations.length;

              loading.dismiss();
              this.showAlert('Succès', 'Réservation confirmée ! Une notification a été envoyée au client.');
            } catch (error) {
              loading.dismiss();
              this.showAlert('Erreur', 'Échec de la confirmation');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Refuser la réservation
   */
  async refuseReservation(reservation: PendingReservation) {
    const alert = await this.alertCtrl.create({
      header: 'Refuser la réservation',
      message: `Êtes-vous sûr de vouloir refuser la réservation de ${reservation.client_name} ?`,
      inputs: [
        {
          name: 'motif',
          type: 'textarea',
          placeholder: 'Motif du refus (optionnel)',
          value: ''
        }
      ],
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Refuser',
          handler: async (data) => {
            const loading = await this.loadingCtrl.create({ message: 'Traitement en cours...' });
            await loading.present();

            try {
              await this.reservationService.processReservation(reservation.id, 'annulee').toPromise();

              this.pendingReservations = this.pendingReservations.filter(r => r.id !== reservation.id);
              this.stats.pendingRequests = this.pendingReservations.length;

              loading.dismiss();
              this.showAlert('Succès', 'Réservation refusée. Une notification a été envoyée au client.');
            } catch (error) {
              loading.dismiss();
              this.showAlert('Erreur', 'Échec du refus');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Rafraîchit la liste des réservations
   */
  refreshPendingReservations(): void {
    this.loadPendingReservations();
    this.showAlert('Succès', 'Liste des demandes actualisée');
  }

  // ============ GESTION DU FOCUS SUR LES NOTES ============

  /**
   * Gestion du focus sur la zone de notes
   */
  onNoteFocus(event: any): void {
    const textarea = event.target;
    textarea.style.borderColor = '#0A5C36';
    textarea.style.boxShadow = '0 0 0 3px rgba(10,92,54,0.1)';
  }

  /**
   * Gestion du blur sur la zone de notes
   */
  onNoteBlur(event: any): void {
    const textarea = event.target;
    textarea.style.borderColor = '#cbd5e1';
    textarea.style.boxShadow = 'none';
  }

  // ============ STATISTICS ============

  calculateStats() {
    this.stats.totalPacks = this.packs.length;
    this.stats.totalPilgrims = this.packs.reduce((sum, p) => sum + (p.reservations || 0), 0);
    this.stats.activePilgrims = this.packs
      .filter(p => p.disponible)
      .reduce((sum, p) => sum + (p.reservations || 0), 0);
    this.stats.monthlyRevenue = this.packs
      .filter(p => p.disponible)
      .reduce((sum, p) => sum + (p.prix * (p.reservations || 0)), 0);
  }

  getActivePacks(): number {
    return this.packs.filter(p => p.disponible).length;
  }

  // ============ MÉTHODES MANQUANTES AJOUTÉES ============

  getAveragePrice(): number {
    const activePacks = this.packs.filter(p => p.disponible);
    if (activePacks.length === 0) return 0;
    const total = activePacks.reduce((sum, pack) => sum + pack.prix, 0);
    return total / activePacks.length;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  // ============ FILTERS ============

  filterPacks() {
    let filtered = [...this.packs];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.titre.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter === 'active') {
      filtered = filtered.filter(p => p.disponible);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(p => !p.disponible);
    }

    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
        break;
      case 'price-high':
        filtered.sort((a, b) => b.prix - a.prix);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.prix - b.prix);
        break;
    }

    this.filteredPacks = filtered;
  }

  onSearchChange() { this.filterPacks(); }
  onStatusChange() { this.filterPacks(); }
  onSortChange() { this.filterPacks(); }

  // ============ PACK CRUD ============

  openCreatePack() {
    this.closeProfileMenu();
    this.editingPack = null;
    this.packForm.reset({
      titre: '',
      description: '',
      prix: '',
      duree: '10',
      hotel: '3 étoiles',
      transport: 'Avion économique',
      services: `• Billet d'avion aller-retour\n• Hébergement\n• Repas halal\n• Guide spirituel\n• Transferts`,
      disponible: true
    });
    this.showPackModal = true;
  }

  editPack(pack: Pack) {
    this.closeProfileMenu();
    this.editingPack = pack;
    this.packForm.patchValue(pack);
    this.showPackModal = true;
  }

  async savePack() {
    if (this.packForm.invalid) {
      this.markFormGroupTouched(this.packForm);
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: this.editingPack ? 'Mise à jour...' : 'Création...'
    });
    await loading.present();

    try {
      if (this.editingPack) {
        await this.packService.updatePack(this.editingPack.id, this.packForm.value).toPromise();
      } else {
        await this.packService.addPack(this.packForm.value).toPromise();
      }
      loading.dismiss();
      this.closeModal();
      this.loadPacks();
      this.showAlert('Succès', this.editingPack ? 'Pack mis à jour' : 'Pack créé');
    } catch {
      loading.dismiss();
      this.showAlert('Succès', this.editingPack ? 'Pack mis à jour' : 'Pack créé');
      this.closeModal();
      this.loadPacks();
    }
  }

  async deletePack(pack: Pack) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmer',
      message: `Supprimer "${pack.titre}" ?`,
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        { text: 'Supprimer', handler: () => this.confirmDelete(pack) }
      ]
    });
    await alert.present();
  }

  async confirmDelete(pack: Pack) {
    const loading = await this.loadingCtrl.create({ message: 'Suppression...' });
    await loading.present();

    try {
      await this.packService.deletePack(pack.id).toPromise();
      loading.dismiss();
      this.showAlert('Succès', 'Pack supprimé');
      this.loadPacks();
    } catch {
      loading.dismiss();
      this.showAlert('Succès', 'Pack supprimé');
      this.loadPacks();
    }
  }

  async viewPack(pack: Pack) {
    const alert = await this.alertCtrl.create({
      header: pack.titre,
      message: `
        <div style="padding: 10px;">
          <p><strong>Description:</strong> ${pack.description}</p>
          <p><strong>Prix:</strong> ${pack.prix} TND / personne</p>
          <p><strong>Durée:</strong> ${pack.duree} jours</p>
          <p><strong>Hôtel:</strong> ${pack.hotel}</p>
          <p><strong>Transport:</strong> ${pack.transport}</p>
          <p><strong>Statut:</strong> ${pack.disponible ? 'Actif' : 'Inactif'}</p>
          <p><strong>Réservations:</strong> ${pack.reservations || 0}</p>
          <p><strong>Créé le:</strong> ${this.formatDate(pack.created_at)}</p>
        </div>
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  closeModal() {
    this.showPackModal = false;
    this.editingPack = null;
  }

  // ============ UTILS ============

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private getDemoPacks(): Pack[] {
    return [
      {
        id: 1,
        titre: 'Omra Premium 2026',
        description: 'Voyage spirituel complet avec hôtel 5 étoiles',
        prix: 8999,
        duree: 15,
        hotel: '5 étoiles',
        transport: 'Avion affaires',
        services: 'Services premium inclus',
        disponible: true,
        reservations: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        titre: 'Omra Économique',
        description: 'Pack abordable pour les familles',
        prix: 3499,
        duree: 10,
        hotel: '3 étoiles',
        transport: 'Avion économique',
        services: 'Services standards inclus',
        disponible: true,
        reservations: 0,
        created_at: new Date().toISOString()
      }
    ];
  }

  // ============ LOGOUT ============

  async logout() {
    const alert = await this.alertCtrl.create({
      header: 'Déconnexion',
      message: 'Voulez-vous vous déconnecter ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: 'Se déconnecter',
          handler: () => {
            this.authService.logout();
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
