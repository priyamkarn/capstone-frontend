import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

import { AuthGuard } from './core/guards/auth.guard';
import { AuthService } from './core/services/auth.service';
import { PaymentService } from './core/services/payment.service';
import { UserService } from './core/services/user.service';

import { NavbarComponent } from './shared/components/navbar.component';
import { FooterComponent } from './shared/components/footer-rating.component';

@NgModule({
  declarations: [
    App
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    NavbarComponent,
    FooterComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    AuthGuard,
    AuthService,
    PaymentService,
    UserService
    // HotelService, BookingService, RoomService removed
  ],
  bootstrap: [App]
})
export class AppModule {}
