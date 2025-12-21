import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { HotelPolicyComponent } from './features/policy/hotel-policy';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { HomeComponent } from './features/home/home.component';
import { DashboardComponent } from './features/user/dashboard.component';
import { PaymentMethodsComponent } from './features/payments/payment-methods.component';
import { BookingOneFileComponent } from './features/booking-flow/booking-one-file.component';

const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Protected routes
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'booking-flow', component: BookingOneFileComponent, canActivate: [AuthGuard] },
  { path: 'payment', component: PaymentMethodsComponent, canActivate: [AuthGuard] },
  { path: 'hotel-policy', component: HotelPolicyComponent },
  // Fallback
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
