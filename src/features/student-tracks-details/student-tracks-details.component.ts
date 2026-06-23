import { Component, inject } from '@angular/core';
import { StudentService } from '../../core/services/student.service';

@Component({
  selector: 'app-student-tracks-details',
  imports: [],
  templateUrl: './student-tracks-details.component.html',
  styleUrl: './student-tracks-details.component.scss'
})
export class StudentTracksDetailsComponent {

  private readonly studentService = inject(StudentService)

  
}
