import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PackService } from '../../services/pack';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone:false
})
export class AdminDashboardPage implements OnInit {

  user = {
    name: 'Administrateur Omra',
    role: 'Administrateur'
  };

  packs: any[] = [];

  constructor(
    private router: Router,
    private packService: PackService   // 👈 هنا
  ) {}

  ngOnInit() {
    console.log('Dashboard Admin chargé');

    // 👇 تحميل الـ packs وقتلي تفتح الصفحة
    this.loadPacks();
  }

  loadPacks() {
    this.packService.getPacks().subscribe(res => {
      this.packs = res as any[];
    });
  }

  ajouterPack() {
    const pack = {
      titre: 'Test',
      description: 'desc',
      prix: 1000,
      duree: 10,
      disponible: true
    };

    this.packService.addPack(pack).subscribe(() => {
      this.loadPacks(); // إعادة تحميل القائمة
    });
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
