import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTracksComponent } from './student-tracks.component';

describe('StudentTracksComponent', () => {
  let component: StudentTracksComponent;
  let fixture: ComponentFixture<StudentTracksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentTracksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
