import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  features = [
    { icon: 'sensors', title: 'Real-Time Monitoring', desc: 'Track RMS vibration and temperature across all industrial assets live.' },
    { icon: 'analytics', title: 'Predictive Analytics', desc: 'AI-assisted threshold alerts that flag equipment before failure occurs.' },
    { icon: 'confirmation_number', title: 'Ticket Management', desc: 'Auto-generated maintenance tickets with full issue tracking history.' },
    { icon: 'tune', title: 'Custom Thresholds', desc: 'Set per-asset RMS and temperature limits to match your operational needs.' }
  ];

  constructor(private router: Router) {}

  goToDashboard() { this.router.navigate(['/dashboard']); }
  goToLogin()     { this.router.navigate(['/login']); }
  goToRegister()  { this.router.navigate(['/register']); }
}
