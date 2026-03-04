// app/models/user.model.ts
export interface User {
  id: number;
  civilite: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  code_postal?: string;
  region?: string;
  role: 'pelerin' | 'agent' | 'admin';
  photo?: string;
  created_at: string;
  updated_at: string;
}
