import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-student-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './student-register.component.html',
  styleUrls: ['./student-register.component.scss'],
})
export class StudentRegisterComponent implements OnInit {
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<any>();

  studentForm!: FormGroup;

  genderOptions = [
    { value: 'Male', label: 'ذكر' },
    { value: 'Female', label: 'أنثى' },
  ];

  // ✅ أضف هذه القائمة
  nationalityOptions = [
    { value: 'Egyption', label: 'مصري' },
    { value: 'Foreign', label: 'أجنبي' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.studentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      studentNationality: ['', Validators.required],
      whatsAppNumber: ['', Validators.required],
      parentWhatsAppNumber: [''],
      studentNotes: [''],
      platformExpectations: [''],
      age: ['', [Validators.required, Validators.min(5), Validators.max(100)]],

      nationalId: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],

      gender: ['', Validators.required],
      residenceCountry: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.studentForm.value);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!field?.invalid && !!field?.touched;
  }
}
