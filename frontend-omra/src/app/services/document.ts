// src/app/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Document {
  id: number;
  reservation_id: number;
  type: 'passeport' | 'visa' | 'photo' | 'autre';
  nom_fichier: string;
  chemin_fichier: string;
  taille: number;
  mime_type: string;
  statut: 'en_attente' | 'valide' | 'rejete';
  commentaire?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8000/api/documents';

  constructor(private http: HttpClient) { }

  /**
   * Upload un document pour une réservation
   */
  uploadDocument(reservationId: number, type: string, file: File): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const formData = new FormData();
    formData.append('reservation_id', reservationId.toString());
    formData.append('type', type);
    formData.append('fichier', file);

    return this.http.post(`${this.apiUrl}/upload`, formData, { headers });
  }

  /**
   * Récupère tous les documents d'une réservation
   */
  getDocumentsByReservation(reservationId: number): Observable<{success: boolean, data: Document[]}> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<{success: boolean, data: Document[]}>(
      `${this.apiUrl}/reservation/${reservationId}`,
      { headers }
    );
  }

  /**
   * Récupère un document spécifique
   */
  getDocument(documentId: number): Observable<Blob> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get(`${this.apiUrl}/${documentId}/fichier`, {
      headers,
      responseType: 'blob'
    });
  }

  /**
   * Valide ou rejette un document (pour l'agent)
   */
  validerDocument(documentId: number, statut: 'valide' | 'rejete', commentaire?: string): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.patch(`${this.apiUrl}/${documentId}/valider`,
      { statut, commentaire },
      { headers }
    );
  }

  /**
   * Supprime un document
   */
  deleteDocument(documentId: number): Observable<any> {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.delete(`${this.apiUrl}/${documentId}`, { headers });
  }
}
