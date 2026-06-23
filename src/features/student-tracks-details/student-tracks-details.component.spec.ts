import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentTracksDetailsComponent } from './student-tracks-details.component';

describe('StudentTracksDetailsComponent', () => {
  let component: StudentTracksDetailsComponent;
  let fixture: ComponentFixture<StudentTracksDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentTracksDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentTracksDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
