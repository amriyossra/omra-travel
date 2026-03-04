import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();
  private apiUrl = environment.apiUrl || 'http://localhost:8000/api';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // Load user from localStorage on init
  private loadUserFromStorage(): void {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.clearStorage();
      }
    }
  }

  login(email: string, password: string, role: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password, role }).pipe(
      tap((response: any) => {
        if (response.success && response.token) {
          this.saveUserData(response.token, response.user, response.user.role || role);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // Enhanced logout with redirect
  logout(): void {
    const token = this.getToken();
    if (token) {
      // Envoyer la requête de déconnexion au serveur
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      });

      this.http.post(`${this.apiUrl}/logout`, {}, { headers }).subscribe({
        next: () => {
          this.clearStorage();
          this.currentUserSubject.next(null);
        },
        error: () => {
          this.clearStorage();
          this.currentUserSubject.next(null);
        }
      });
    } else {
      this.clearStorage();
      this.currentUserSubject.next(null);
    }
  }

  // Clear all storage
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    sessionStorage.clear();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getAuthHeaders() {
    const token = this.getToken();
    return token ? new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }) : new HttpHeaders();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Get current user data
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  // Save user data after login
  saveUserData(token: string, user: any, role: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('role', role);
    this.currentUserSubject.next(user);
  }

  // Check user role
  hasRole(role: string): boolean {
    const storedRole = localStorage.getItem('role');
    return storedRole === role;
  }
}
