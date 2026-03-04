import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DemandePersonnaliseeData {
  nombre_personnes: number;
  duree: number;
  date_depart: string;
  ville_depart: string;
  hotel_makkah: string;
  hotel_medina: string;
  type_chambre: string;
  visa: boolean;
  assurance: boolean;
  transport_local: boolean;
  guide_prive: boolean;
  repas_inclus: boolean;
  zamzam: boolean;
  budget: number;
  mode_paiement: string;
  demandes_speciales: string;
}

@Injectable({
  providedIn: 'root'
})
export class DemandePersonnaliseeService {
  private apiUrl = 'http://localhost:8000/api/demandes-personnalisees';

  constructor(private http: HttpClient) {}

  createDemande(data: DemandePersonnaliseeData): Observable<any> {
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
}
