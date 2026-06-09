import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSessionsComponent } from './student-sessions.component';

describe('StudentSessionsComponent', () => {
  let component: StudentSessionsComponent;
  let fixture: ComponentFixture<StudentSessionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentSessionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
