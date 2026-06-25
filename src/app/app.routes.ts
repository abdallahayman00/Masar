// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';
import { adminGuard } from '../core/guards/admin.guard';
import { studentGuard } from '../core/guards/student.guard';
import { teacherGuard } from '../core/guards/teacher.guard';
import { adminOrTeacherGuard } from '../core/guards/adminOrTeacherGuard.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('../features/auth/login/login/login.component').then(
            (m) => m.LoginComponent,
          ),
      },

      {
        path: 'register',
        loadComponent: () =>
          import('../features/auth/register/register/register.component').then(
            (m) => m.RegisterComponent,
          ),
      },

      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../features/dashboard/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },

  // ✅ Teacher Requests (طلبات المعلمين)
  {
    path: 'teacher-requests',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('../features/Teacher/teacher-requests/teacher-requests.component').then(
        (m) => m.TeacherRequestsComponent,
      ),
  },

  // ✅ Approved Teachers (المعلمون المعتمدون)
  {
    path: 'approved-teachers',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('../features/Teacher/approved-teachers/approved-teachers.component').then(
        (m) => m.ApprovedTeachersComponent,
      ),
  },

  // ✅ Add Teacher (إضافة معلم جديد)
  {
    path: 'add-teacher',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('../features/Teacher/add-teacher/add-teacher.component').then(
        (m) => m.AddTeacherComponent,
      ),
  },

  // ✅ Students Routes (الطلاب)
  {
    path: 'student-requests',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('../features/students/students/students.component').then(
        (m) => m.StudentsComponent,
      ),
  },

  // ✅ Tracks Routes (المسارات)
  {
    path: 'tracks',
    canActivate: [authGuard, adminOrTeacherGuard],
    loadComponent: () =>
      import('../features/track/tracks/tracks.component').then(
        (m) => m.TracksComponent,
      ),
  },

  // ✅ Pending Batches Routes (الدفعات المعلقة) - جديد
  {
    path: 'pending-batches',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('../features/students/batches/pending-batches/pending-batches.component').then(
        (m) => m.PendingBatchesComponent,
      ),
  },
  // ✅ Accepted Batches Routes (الدفعات المقبولة)
  {
    path: 'accepted-batches',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('../features/students/batches/accepted-batches/accepted-batches.component').then(
        (m) => m.AcceptedBatchesComponent,
      ),
  },

  {
    path: 'student-tracks',
    canActivate: [authGuard, studentGuard],
    loadComponent: () =>
      import('../features/student-tracks/student-tracks.component').then(
        (m) => m.StudentTracksComponent,
      ),
  },

  {
    path: 'track-details/:trackId',
    canActivate: [authGuard, studentGuard],
    loadComponent: () =>
      import('../features/track-details/track-details.component').then(
        (m) => m.TrackDetailsComponent,
      )
  },

  {
    path: 'available-tracks',
    canActivate: [authGuard, studentGuard],
    loadComponent: () =>
      import('../features/available-tracks/available-tracks.component').then(
        (m) => m.AvailableTracksComponent,
      )
  },

  {
    path: 'select-teacher/:trackId',
    canActivate: [authGuard, studentGuard],
    loadComponent: () =>
      import('../features/select-teacher/select-teacher.component').then(
        (m) => m.SelectTeacherComponent,
      )
  },

  {
    path: 'weekly-schedule',
    canActivate: [authGuard, teacherGuard],
    loadComponent: () =>
      import('../features/weekly-schedule/weekly-schedule.component').then(
        (m) => m.WeeklyScheduleComponent,
      ),
  },
  {
    path: 'available-times',
    canActivate: [authGuard, teacherGuard],
    loadComponent: () =>
      import('../features/available-times/available-times.component').then(
        (m) => m.AvailableTimesComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
