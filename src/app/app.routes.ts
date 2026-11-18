import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home';
import { OcrPage } from './pages/ocr-page/ocr-page';
import { DashboardPage } from './pages/dashboard/dashboard';
import { LoginPage } from './pages/login/login';
import { Page1 } from './pages/page1/page1';
import { Page2 } from './pages/page2/page2';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'login', component: LoginPage },
  { path: 'ocr', component: OcrPage, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardPage },
  { path: 'page1', component: Page1 },
  { path: 'page2', component: Page2 },
  { path: '**', redirectTo: '' }
];