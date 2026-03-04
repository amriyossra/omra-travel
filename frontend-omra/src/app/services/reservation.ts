import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReservationData {
  // Relations
  user_id?: number;
  pack_id: number;

  // Informations personnelles
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  passeport_numero: string;
  passeport_expiration: string;

  // Adresse
  adresse: string;
  code_postal: string;
  ville: string;
  pays: string;

  // Détails réservation
  nombre_personnes: number;
  nombre_chambres: number;
  accompagnants?: any;

  // Options
  assurance: boolean;
  visa: boolean;
  transport_local: boolean;
  guide_prive: boolean;
  demandes_speciales?: string;

  // Préférences
  type_chambre: string;
  regime_alimentaire: string;
  regime_alimentaire_autre?: string;

  // Médical
  probleme_sante: boolean;
  informations_medicales?: string;

  // Paiement
  prix_total: number;
  acompte?: number;
  statut_paiement: string;
  mode_paiement: string;
  reference_paiement?: string;

  // Statut
  statut: string;
  date_depart?: string;
  date_retour?: string;

  // Notes
  notes_pelerin?: string;

  // Métadonnées
  code_reservation?: string;
}

export interface Reservation {
  id: number;
  pack_id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  statut: 'en_attente' | 'validée' | 'refusée';
  created_at: string;
  updated_at?: string;
  date_depart?: string;
  date_retour?: string;
  notes_pelerin?: string;
  prix_total?: number;
  acompte?: number;
  statut_paiement?: string;
  mode_paiement?: string;
  reference_paiement?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8000/api/reservations';

  constructor(private http: HttpClient) { }

  /**
   * Crée une nouvelle réservation
   */
  createReservation(data: ReservationData): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(this.apiUrl, data, { headers });
  }

  /**
   * Récupère toutes les réservations d'un pèlerin
   */
  getMesReservations(userId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.apiUrl}/user/${userId}`, { headers });
  }

  /**
   * Récupère une réservation par son code
   */
  getReservationByCode(code: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.apiUrl}/code/${code}`, { headers });
  }

  /**
   * Récupère les réservations par pack
   */
  getReservationsByPack(packId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.apiUrl}?pack_id=${packId}`, { headers });
  }

  /**
   * Annule une réservation
   */
  annulerReservation(id: number, motif?: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.patch(`${this.apiUrl}/${id}/annuler`, { motif }, { headers });
  }

  /**
   * Récupère uniquement les demandes en attente
   */
  getPendingReservations(): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${this.apiUrl}?statut=en_attente`;
    console.log('📡 Appel API vers:', url);
    console.log('🔑 Token présent:', !!token);

    return this.http.get<any>(url, { headers });
  }

  /**
   * Traite une demande de réservation (valider ou refuser)
   */
  processReservation(id: number, action: 'confirmee' | 'annulee', motif?: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const data: any = { statut: action };
    if (motif) {
      data.motif = motif;
    }

    return this.http.put(`${this.apiUrl}/${id}`, data, { headers });
  }

  /**
   * Récupère toutes les réservations avec filtres optionnels
   */
  getAllReservations(params?: any): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    let url = this.apiUrl;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key]);
        }
      });
      url += `?${queryParams.toString()}`;
    }

    return this.http.get(url, { headers });
  }

  // ============ NOUVELLES MÉTHODES POUR LE TRAITEMENT DES DEMANDES ============

  /**
   * Récupère les documents d'une réservation
   */
  getReservationDocuments(reservationId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.apiUrl}/${reservationId}/documents`, { headers });
  }

  /**
   * Demande des documents manquants
   */
  requestMissingDocuments(reservationId: number, documents: string[]): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.apiUrl}/${reservationId}/documents/request`, { documents }, { headers });
  }

  /**
   * Relance pour un document spécifique
   */
  remindDocument(reservationId: number, documentType: string, message: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.apiUrl}/${reservationId}/documents/${documentType}/remind`, { message }, { headers });
  }

  /**
   * Propose un pack alternatif
   */
  proposeAlternative(reservationId: number, packId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(`${this.apiUrl}/${reservationId}/propose-alternative`, { pack_id: packId }, { headers });
  }
}
