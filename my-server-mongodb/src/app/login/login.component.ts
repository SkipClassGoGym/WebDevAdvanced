import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage = '';

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.http.get<{ username?: string; password?: string }>('/auth/cookie').subscribe({
      next: (data) => {
        this.username = data.username ?? '';
        this.password = data.password ?? '';
      },
    });
  }

  onLogin() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.errorMessage = '';

    const body = new URLSearchParams();
    body.set('name', this.username);
    body.set('password', this.password);

    this.http
      .post('/auth/login', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        responseType: 'text',
        observe: 'response',
      })
      .subscribe({
        next: () => {
          // Login successful – navigate within the SPA (no page reload)
          window.location.href = '/login';
        },
        error: (err) => {
          this.errorMessage =
            err.error ?? 'Login failed. Please try again.';
        },
      });
  }
}
