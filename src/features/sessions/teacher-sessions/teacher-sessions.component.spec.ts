import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherSessionsComponent } from './teacher-sessions.component';

describe('TeacherSessionsComponent', () => {
  let component: TeacherSessionsComponent;
  let fixture: ComponentFixture<TeacherSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherSessionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
