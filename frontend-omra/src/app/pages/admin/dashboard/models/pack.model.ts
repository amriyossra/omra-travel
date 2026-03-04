export interface Pack {
  id: number;
  titre: string;
  description: string;
  prix: number;
  duree: number;
  image?: string;
  disponible: boolean;
  created_at: string;
  updated_at: string;
}
