import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, LoadingController } from '@ionic/angular';
import { ReservationService } from '../../services/reservation';
import { DocumentService } from '../../services/document';

interface ReservationResponse {
  success: boolean;
  message?: string;
  data?: {
    code_reservation?: string;
    id?: number;
    [key: string]: any;
  };
}

interface UploadedFile {
  file: File;
  type: string;
  progress: number;
  uploaded: boolean;
  error?: string;
  documentId?: number;
}

interface MesReservation {
  id: number;
  pack_id: number;
  pack_titre: string;
  date_depart: string;
  date_retour: string;
  statut: string;
  prix_total: number;
  nombre_personnes: number;
  created_at: string;
  duree?: number;
  notes?: string;
  nombre_chambres?: number;
}

@Component({
  selector: 'app-pelerin-dashboard',
  templateUrl: './pelerin-dashboard.page.html',
  styleUrls: ['./pelerin-dashboard.page.scss'],
  standalone: false
})
export class PelerinDashboardPage implements OnInit {
  // Utilisateur
  user = {
    name: 'Pèlerin Omra',
    role: 'Pèlerin',
    email: '',
    avatar: 'https://ui-avatars.com/api/?name=Pelerin+Omra&background=1e3c72&color=fff&size=128'
  };
  userAvatar: string = this.user.avatar;
  notificationCount: number = 2;
  showProfileMenu: boolean = false;

  // ============ MES RÉSERVATIONS ============
  mesReservations: MesReservation[] = [];
  filteredReservations: MesReservation[] = [];
  loadingReservations: boolean = false;
  reservationFilter: string = 'tous';

  // Modals
  showReservationDetailsModal: boolean = false;
  selectedReservation: MesReservation | null = null;
  showDocuments: boolean = false;

  // ============ PROPRIÉTÉS POUR UPLOAD ============
  uploadedFiles: { [key: string]: UploadedFile } = {};
  uploadErrors: { [key: string]: string } = {};

  documentsRequired = [
    { type: 'passeport', label: 'Passeport', required: true, accept: '.pdf,.jpg,.jpeg,.png', maxSize: 5 * 1024 * 1024 },
    { type: 'photo', label: "Photo d'identité", required: true, accept: '.jpg,.jpeg,.png', maxSize: 2 * 1024 * 1024 }
  ];

  uploadProgress: { [key: string]: number } = {};
  currentReservationId: number | null = null;

  // Nationalités courantes
  nationalites = ['Tunisienne'];

  // Date du jour pour validation
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private router: Router,
    private reservationService: ReservationService,
    private documentService: DocumentService,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    console.log('📌 PelerinDashboard - Chargement initial');
  }

  ionViewDidEnter() {
    console.log('🔄 Page active, rechargement des données utilisateur');
    this.loadUserEmail();
    this.loadMesReservations();
  }

  // ============ OBTENIR L'ID DE L'UTILISATEUR CONNECTÉ ============
  getCurrentUserId(): number | null {
    console.log('🔍 RECHERCHE DE L\'ID UTILISATEUR...');

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) {
          console.log('✅ ID trouvé dans user object:', user.id);
          return user.id;
        }
      } catch (e) {
        console.warn('❌ Erreur parsing user:', e);
      }
    }

    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      const id = parseInt(storedUserId, 10);
      if (!isNaN(id)) {
        console.log('✅ ID trouvé dans localStorage (userId):', id);
        return id;
      }
    }

    console.warn('❌ Aucun ID utilisateur trouvé');
    return null;
  }

  // ============ CHARGER MES RÉSERVATIONS ============
  loadMesReservations() {
    this.loadingReservations = true;
    console.log('📥 Chargement des réservations...');

    const userId = this.getCurrentUserId();
    console.log('👤 User ID connecté:', userId);

    if (!userId) {
      console.warn('⚠️ Utilisateur non connecté ou ID invalide');
      this.loadingReservations = false;
      this.mesReservations = [];
      this.filteredReservations = [];
      return;
    }

    this.reservationService.getMesReservations(userId).subscribe({
      next: (response: any) => {
        this.loadingReservations = false;

        console.log('📦 Réponse API brute:', response);

        if (response?.success && response?.data) {
          console.log(`✅ ${response.data.length} réservation(s) trouvée(s)`);

          this.mesReservations = response.data.map((r: any) => ({
            id: r.id,
            pack_id: r.pack_id,
            pack_titre: r.pack?.titre || 'Pack Omra',
            date_depart: r.date_depart,
            date_retour: r.date_retour,
            statut: r.statut,
            prix_total: r.prix_total,
            nombre_personnes: r.nombre_personnes,
            created_at: r.created_at
          }));

          console.log('✅ Réservations formatées:', this.mesReservations);
          this.filterReservations();
        } else {
          console.warn('⚠️ Aucune réservation trouvée');
          this.mesReservations = [];
          this.filteredReservations = [];
        }
      },
      error: (err) => {
        this.loadingReservations = false;
        console.error('❌ Erreur chargement réservations:', err);
        this.mesReservations = [];
        this.filteredReservations = [];
      }
    });
  }

  // ============ FILTRER LES RÉSERVATIONS ============
  filterReservations() {
    if (this.reservationFilter === 'tous') {
      this.filteredReservations = [...this.mesReservations];
    } else {
      this.filteredReservations = this.mesReservations.filter(
        r => r.statut === this.reservationFilter
      );
    }
  }

  // ============ CHANGER LE FILTRE ============
  onFilterChange(filter: string) {
    this.reservationFilter = filter;
    this.filterReservations();
  }

  // ============ MÉTHODE POUR COMPTER LES RÉSERVATIONS PAR STATUT ============
  getReservationsCountByStatus(status: string): number {
    return this.mesReservations.filter(r => r.statut === status).length;
  }

  // ============ LIBELLÉ STATUT ============
  getStatutLabel(statut: string): string {
    const labels: {[key: string]: string} = {
      'en_attente': 'En attente',
      'validée': 'Confirmée',
      'refusée': 'Refusée',
      'confirmee': 'Confirmée',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  }

  // ============ CLASSE STATUT ============
  getStatutClass(statut: string): string {
    const classes: {[key: string]: string} = {
      'en_attente': 'status-pending',
      'validée': 'status-confirmed',
      'refusée': 'status-rejected',
      'confirmee': 'status-confirmed',
      'en_cours': 'status-ongoing',
      'terminee': 'status-completed',
      'annulee': 'status-cancelled'
    };
    return classes[statut] || 'status-default';
  }

  // ============ MÉTHODES POUR LE MODAL DE DÉTAILS ============
  viewReservationDetails(reservation: MesReservation) {
    this.selectedReservation = reservation;
    this.showReservationDetailsModal = true;
  }

  closeReservationDetailsModal() {
    this.showReservationDetailsModal = false;
    this.selectedReservation = null;
  }

  getStatutIcon(statut: string): string {
    const icons: {[key: string]: string} = {
      'en_attente': 'time-outline',
      'validée': 'checkmark-circle-outline',
      'refusée': 'close-circle-outline',
      'confirmee': 'checkmark-circle-outline',
      'en_cours': 'sync-outline',
      'terminee': 'flag-outline',
      'annulee': 'ban-outline'
    };
    return icons[statut] || 'help-outline';
  }

  calculerDuree(reservation: MesReservation): number {
    if (reservation.duree) return reservation.duree;
    if (reservation.date_depart && reservation.date_retour) {
      return Math.ceil(
        (new Date(reservation.date_retour).getTime() - new Date(reservation.date_depart).getTime()) /
        (1000 * 60 * 60 * 24)
      );
    }
    return 0;
  }

  // ============ CHARGER L'EMAIL DE L'UTILISATEUR CONNECTÉ ============
  private loadUserEmail() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.email) {
          this.user.email = user.email;
          console.log('📧 Email depuis user object:', this.user.email);
          return;
        }
      } catch (e) {
        console.warn('Erreur parsing user', e);
      }
    }
  }

  // ============ GESTION DU PROFIL ============
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const profileBtn = target.closest('.btn-profile');
    const profileDropdown = target.closest('.profile-dropdown');

    if (!profileBtn && !profileDropdown) {
      this.showProfileMenu = false;
    }
  }

  async viewNotifications(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Notifications',
      message: `Vous avez ${this.notificationCount} notification(s) non lues`,
      buttons: ['OK']
    });
    await alert.present();
  }

  editProfile() {
    this.router.navigate(['/pelerin/profile']);
  }

  openUploadModal() {
    this.showDocuments = !this.showDocuments;
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

  async uploadDocuments(reservationId: number) {
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
        console.log('Tous les documents ont été uploadés avec succès');
        return true;
      } catch (error) {
        console.error('Erreur lors de l\'upload des documents:', error);
        return false;
      }
    }
    return true;
  }

  // ============ UTILS ============
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
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
