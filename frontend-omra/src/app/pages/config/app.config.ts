// src/app/config/app.config.ts
export const AppConfig = {
  // Ajustez selon votre configuration Laravel
  api: {
    baseUrl: 'http://localhost:8000/api',
    endpoints: {
      auth: {
        login: '/login',
        register: '/register',
        logout: '/logout',
        profile: '/profile',
        forgotPassword: '/forgot-password',
        resetPassword: '/reset-password'
      },
      pelerin: {
        profile: '/pelerin/profile',
        reservations: '/pelerin/reservations',
        packs: '/pelerin/packs'
      },
      agent: {
        clients: '/agent/clients',
        reservations: '/agent/reservations',
        statistics: '/agent/statistics'
      },
      admin: {
        users: '/admin/users',
        agents: '/admin/agents',
        statistics: '/admin/statistics'
      }
    }
  },

  // Configuration des rôles
  roles: {
    pelerin: 'pelerin',
    agent: 'agent',
    admin: 'admin'
  },

  // Configuration téléphone Tunisie
  phone: {
    countryCode: '+216',
    pattern: /^(2|4|5|9)\d{7}$/,
    format: 'XX XXX XXX'
  },

  // Validation
  validation: {
    password: {
      minLength: 6
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    }
  },

  // Messages
  messages: {
    success: {
      register: 'Compte créé avec succès !',
      login: 'Connexion réussie !',
      logout: 'Déconnexion réussie'
    },
    error: {
      required: 'Ce champ est obligatoire',
      email: 'Format email invalide',
      phone: 'Numéro de téléphone tunisien invalide',
      password: 'Le mot de passe doit contenir au moins 6 caractères',
      passwordMatch: 'Les mots de passe ne correspondent pas'
    }
  }
};
