import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MealsComponent } from './components/meals/meals.component';
import { ExercisesComponent } from './components/exercises/exercises.component';
import { WeightsComponent } from './components/weights/weights.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { TopicsComponent } from './components/topics/topics.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'meals', component: MealsComponent, canActivate: [AuthGuard] },
  { path: 'exercises', component: ExercisesComponent, canActivate: [AuthGuard] },
  { path: 'weights', component: WeightsComponent, canActivate: [AuthGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard] },
  { path: 'topics', component: TopicsComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
