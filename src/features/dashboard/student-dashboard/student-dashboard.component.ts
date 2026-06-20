import { Component } from '@angular/core';
import { StudentSessionsComponent } from "../../sessions/student-sessions/student-sessions.component";

@Component({
  selector: 'app-student-dashboard',
  imports: [StudentSessionsComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss'
})
export class StudentDashboardComponent {

}
