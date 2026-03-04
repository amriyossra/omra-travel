// app/models/reservation.model.ts
export interface Reservation {
  id: number;
  user_id: number;
  pack_id: number;
  date_depart: string;
  date_retour: string;
  nombre_personnes: number;
  statut: 'en_attente' | 'confirme' | 'annule';
  montant_total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  pack?: Pack;
  user?: User;
}
