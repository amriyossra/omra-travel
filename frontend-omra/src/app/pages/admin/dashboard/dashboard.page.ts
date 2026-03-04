import { Component, OnInit, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.page.html',
  styleUrls: ['./admin-dashboard.page.scss'],
  standalone:false
})
export class AdminDashboardPage implements OnInit, AfterViewInit {

  stats: any = {
    total_users: 154,
    total_reservations: 287,
    total_packs: 12,
    revenue_total: 452800
  };

  packs: any[] = [
    {
      id: 1,
      titre: "Pack Omra Économique",
      description: "Voyage essentiel pour le pèlerinage",
      prix: 3500,
      duree: 15,
      disponible: true
    },
    {
      id: 2,
      titre: "Pack Omra Confort",
      description: "Confort et spiritualité réunis",
      prix: 5200,
      duree: 18,
      disponible: true
    },
    {
      id: 3,
      titre: "Pack Omra Premium",
      description: "Expérience premium complète",
      prix: 7800,
      duree: 21,
      disponible: true
    },
    {
      id: 4,
      titre: "Pack Omra Familial",
      description: "Spécial famille (4 personnes)",
      prix: 12500,
      duree: 20,
      disponible: false
    },
    {
      id: 5,
      titre: "Pack Omra VIP",
      description: "Service VIP et hôtels 5 étoiles",
      prix: 15000,
      duree: 25,
      disponible: true
    }
  ];

  activities: any[] = [
    {
      type: 'user',
      icon: 'person-add',
      title: 'Nouvel utilisateur inscrit',
      description: 'Mohamed Ali s\'est inscrit comme pèlerin',
      time: 'Il y a 10 min'
    },
    {
      type: 'reservation',
      icon: 'calendar',
      title: 'Nouvelle réservation',
      description: 'Pack Omra Premium réservé',
      time: 'Il y a 45 min'
    },
    {
      type: 'pack',
      icon: 'briefcase',
      title: 'Pack modifié',
      description: 'Pack Économique mis à jour',
      time: 'Il y a 2 heures'
    },
    {
      type: 'user',
      icon: 'shield-checkmark',
      title: 'Agent validé',
      description: 'Agent "Voyages Sacrés" validé',
      time: 'Il y a 5 heures'
    },
    {
      type: 'reservation',
      icon: 'cash',
      title: 'Paiement reçu',
      description: 'Paiement de 5200 TND confirmé',
      time: 'Il y a 1 jour'
    }
  ];

  constructor() { }

  ngOnInit() {
    console.log('Dashboard Administrateur chargé');
  }

  ngAfterViewInit() {
    this.initializeChart();
  }

  initializeChart() {
    const ctx = document.getElementById('reservationsChart') as HTMLCanvasElement;

    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
          datasets: [{
            label: 'Réservations',
            data: [45, 52, 48, 65, 70, 85, 92, 88, 75, 95, 110, 125],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false,
              },
              ticks: {
                stepSize: 20
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  ajouterPack() {
    console.log('Ajouter un nouveau pack');
    // Logique pour ajouter un pack
    alert('Fonctionnalité d\'ajout de pack');
  }

  editerPack(pack: any) {
    console.log('Éditer le pack:', pack);
    // Logique pour éditer un pack
    alert(`Édition du pack: ${pack.titre}`);
  }

  supprimerPack(id: number) {
    console.log('Supprimer le pack ID:', id);

    // Confirmation
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
      // Logique pour supprimer un pack
      this.packs = this.packs.filter(pack => pack.id !== id);
      console.log(`Pack ${id} supprimé`);
    }
  }
}
