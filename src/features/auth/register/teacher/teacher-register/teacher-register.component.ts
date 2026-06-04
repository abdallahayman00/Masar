import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-teacher-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './teacher-register.component.html',
  styleUrls: ['./teacher-register.component.scss'],
})
export class TeacherRegisterComponent implements OnInit {
  @Input() loading = false;
  @Output() formSubmit = new EventEmitter<FormData>();

  teacherForm!: FormGroup;

  // File previews
  profileImagePreview: string | null = null;
  introductionAudioName: string | null = null;
  cvFileName: string | null = null;

  genderOptions = [
    { value: 'Male', label: 'ذكر' },
    { value: 'Female', label: 'أنثى' },
  ];

  nationalityOptions = [
    { value: 'Egyption', label: 'مصري' },
    { value: 'Foreign', label: 'أجنبي' },
  ];

  // Drag state
  isDraggingImage = false;
  isDraggingAudio = false;
  isDraggingCv = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.teacherForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      whatsAppNumber: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      nationality: ['', Validators.required],
      gender: ['', Validators.required],
      residenceCountry: ['', Validators.required],
      summary: ['', Validators.required],
      nationalId: ['', Validators.required],
      profileImage: [null],
      introductionAudio: [null],
      cvFile: [null],
    });
  }

  onFileSelected(event: Event, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0], fieldName);
    }
  }

  onDragOver(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDraggingState(fieldName, true);
  }

  onDragLeave(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDraggingState(fieldName, false);
  }

  onDrop(event: DragEvent, fieldName: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.setDraggingState(fieldName, false);

    const files = event.dataTransfer?.files;
    if (files && files[0]) {
      this.handleFile(files[0], fieldName);
    }
  }

  private setDraggingState(fieldName: string, isDragging: boolean): void {
    switch (fieldName) {
      case 'profileImage':
        this.isDraggingImage = isDragging;
        break;
      case 'introductionAudio':
        this.isDraggingAudio = isDragging;
        break;
      case 'cvFile':
        this.isDraggingCv = isDragging;
        break;
    }
  }

  private handleFile(file: File, fieldName: string): void {
    if (fieldName === 'profileImage') {
      if (!file.type.startsWith('image/')) {
        alert('يرجى رفع ملف صورة فقط');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }

    if (fieldName === 'introductionAudio') {
      if (!file.type.startsWith('audio/')) {
        alert('يرجى رفع ملف صوتي فقط');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف الصوتي يجب أن لا يتجاوز 10 ميجابايت');
        return;
      }
      this.introductionAudioName = file.name;
    }

    if (fieldName === 'cvFile') {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        alert('يرجى رفع ملف PDF أو Word فقط');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم ملف السيرة الذاتية يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }
      this.cvFileName = file.name;
    }

    this.teacherForm.patchValue({ [fieldName]: file });
  }

  onSubmit(): void {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    // إضافة جميع الحقول النصية
    formData.append('fullName', this.teacherForm.get('fullName')?.value || '');
    formData.append('email', this.teacherForm.get('email')?.value || '');
    formData.append('password', this.teacherForm.get('password')?.value || '');
    formData.append(
      'whatsAppNumber',
      this.teacherForm.get('whatsAppNumber')?.value || '',
    );
    formData.append(
      'age',
      this.teacherForm.get('age')?.value?.toString() || '',
    );
    formData.append(
      'nationality',
      this.teacherForm.get('nationality')?.value || '',
    );
    formData.append('gender', this.teacherForm.get('gender')?.value || '');
    formData.append(
      'residenceCountry',
      this.teacherForm.get('residenceCountry')?.value || '',
    );
    formData.append('summary', this.teacherForm.get('summary')?.value || '');
    formData.append(
      'nationalId',
      this.teacherForm.get('nationalId')?.value || '',
    );

    // إضافة الملفات
    const profileImage = this.teacherForm.get('profileImage')?.value;
    if (profileImage) {
      formData.append('ProfileImage', profileImage);
    }

    const introductionAudio = this.teacherForm.get('introductionAudio')?.value;
    if (introductionAudio) {
      formData.append('IntroductionAudio', introductionAudio);
    }

    const cvFile = this.teacherForm.get('cvFile')?.value;
    if (cvFile) {
      formData.append('CvFile', cvFile);
    }

    this.formSubmit.emit(formData);
  }

  removeFile(fieldName: string): void {
    this.teacherForm.patchValue({ [fieldName]: null });

    if (fieldName === 'profileImage') {
      this.profileImagePreview = null;
      const input = document.getElementById(
        'profileImageInput',
      ) as HTMLInputElement;
      if (input) input.value = '';
    } else if (fieldName === 'introductionAudio') {
      this.introductionAudioName = null;
      const input = document.getElementById(
        'introductionAudioInput',
      ) as HTMLInputElement;
      if (input) input.value = '';
    } else if (fieldName === 'cvFile') {
      this.cvFileName = null;
      const input = document.getElementById('cvFileInput') as HTMLInputElement;
      if (input) input.value = '';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.teacherForm.get(fieldName);
    return !!field?.invalid && !!field?.touched;
  }
}
