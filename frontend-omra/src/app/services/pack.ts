import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PackService {
  private publicApiUrl = 'http://localhost:8000/api/pelerin/packs';
  private agentApiUrl = 'http://localhost:8000/api/packs';

  constructor(private http: HttpClient) { }

  // Headers avec token d'authentification
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found! User might not be logged in.');
      return new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // ============ MÉTHODES PUBLIQUES (SANS AUTH) ============

  /**
   * Récupérer tous les packs disponibles pour les clients (public)
   * Tous les clients voient les mêmes packs créés par les agents
   */
  getPublicPacks(): Observable<any> {
    return this.http.get(this.publicApiUrl).pipe(
      catchError(error => {
        console.error('Erreur API getPublicPacks:', error);
        return throwError(() => new Error(error.error?.message || 'Erreur lors de la récupération des packs'));
      })
    );
  }

  // ============ MÉTHODES AVEC AUTH (POUR LES AGENTS) ============

  /**
   * Récupérer tous les packs de l'agent connecté
   */
  getPacks(): Observable<any> {
    return this.http.get(this.agentApiUrl, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API getPacks:', error);
        return throwError(() => new Error(error.error?.message || 'Erreur lors de la récupération des packs'));
      })
    );
  }

  /**
   * Créer un nouveau pack
   */
  addPack(packData: any): Observable<any> {
    return this.http.post(this.agentApiUrl, packData, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API addPack:', error);

        // Formater les messages d'erreur de validation
        if (error.status === 422 && error.error?.errors) {
          const validationErrors = error.error.errors;
          let errorMessage = 'Erreurs de validation:\n';

          Object.keys(validationErrors).forEach(key => {
            errorMessage += `- ${validationErrors[key].join(', ')}\n`;
          });

          return throwError(() => new Error(errorMessage));
        }

        return throwError(() => new Error(error.error?.message || 'Erreur lors de la création du pack'));
      })
    );
  }

  /**
   * Mettre à jour un pack
   */
  updatePack(id: number, packData: any): Observable<any> {
    return this.http.put(`${this.agentApiUrl}/${id}`, packData, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API updatePack:', error);

        if (error.status === 422 && error.error?.errors) {
          const validationErrors = error.error.errors;
          let errorMessage = 'Erreurs de validation:\n';

          Object.keys(validationErrors).forEach(key => {
            errorMessage += `- ${validationErrors[key].join(', ')}\n`;
          });

          return throwError(() => new Error(errorMessage));
        }

        if (error.status === 404) {
          return throwError(() => new Error('Pack non trouvé ou vous n\'avez pas les permissions'));
        }

        return throwError(() => new Error(error.error?.message || 'Erreur lors de la mise à jour du pack'));
      })
    );
  }

  /**
   * Supprimer un pack
   */
  deletePack(id: number): Observable<any> {
    return this.http.delete(`${this.agentApiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.error('Erreur API deletePack:', error);

        if (error.status === 404) {
          return throwError(() => new Error('Pack non trouvé ou vous n\'avez pas les permissions'));
        }

        return throwError(() => new Error(error.error?.message || 'Erreur lors de la suppression du pack'));
      })
    );
  }
}
