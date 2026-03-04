import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Pages publiques
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule) },
  { path: 'about', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutPageModule) },
  { path: 'blog', loadChildren: () => import('./pages/blog/blog.module').then(m => m.BlogPageModule) },
  { path: 'contact', loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactPageModule) },

  // Authentification
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
  { path: 'register', loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule) },
  { path: 'omra-personnalise', loadChildren: () => import('./pages/omra-personnalise/omra-personnalise.module').then(m => m.OmraPersonnalisePageModule) },

  // Espaces privés
  { path: 'pelerin-dashboard', loadChildren: () => import('./pages/pelerin-dashboard/pelerin-dashboard.module').then(m => m.PelerinDashboardPageModule) },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule) },
{ path: 'agent-dashboard', loadChildren: () => import('./pages/agent-dashboard/agent-dashboard.module').then(m => m.AgentDashboardPageModule) },
  { path: 'admin-dashboard', loadChildren: () => import('./pages/admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardPageModule) },
  // Fallback
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
