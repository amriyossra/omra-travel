import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent implements OnInit {
  isLoggedIn: boolean = false;
  isDropdownOpen: boolean = false;

  userName: string = '';
  userEmail: string = '';
  userAvatar: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;

    if (this.isLoggedIn) {
      this.loadUserData();
    }
  }

  loadUserData() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName = user.nom || user.prenom || user.name || 'Pèlerin';
        this.userEmail = user.email || '';
        this.userAvatar = `https://ui-avatars.com/api/?name=${this.userName}&background=1e3c72&color=fff&size=128`;
      } catch (e) {
        console.warn('Erreur parsing user', e);
      }
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.dropdown-container');

    if (!dropdown) {
      this.isDropdownOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    this.isLoggedIn = false;
    this.isDropdownOpen = false;
    this.router.navigate(['/home']);
  }
}
