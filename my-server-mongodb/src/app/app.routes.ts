import { Routes } from '@angular/router';
import { Exercise6061Component } from './exercise-60-61/exercise-60-61.component';

export const routes: Routes = [
  { path: '', redirectTo: 'exercise-60-61', pathMatch: 'full' },
  { path: 'exercise-60-61', component: Exercise6061Component },
  { path: 'login', component: Exercise6061Component },
];
