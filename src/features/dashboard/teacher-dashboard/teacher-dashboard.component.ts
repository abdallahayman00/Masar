import { Component } from '@angular/core';
import { TeacherSessionsComponent } from '../../../features/sessions/teacher-sessions/teacher-sessions.component'; // عدّل المسار حسب موقع الملف

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true, // يجب أن يكون standalone لتتمكن من import مكونات أخرى
  imports: [TeacherSessionsComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.scss',
})
export class TeacherDashboardComponent {}
