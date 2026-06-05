import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent as AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';
import { TeacherDashboardComponent } from '../teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from '../student-dashboard/student-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AdminDashboardComponent, TeacherDashboardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  role = '';

  ngOnInit(): void {
    this.role =
      localStorage.getItem('role') || sessionStorage.getItem('role') || '';
  }
}
