import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableTracksComponent } from './available-tracks.component';

describe('AvailableTracksComponent', () => {
  let component: AvailableTracksComponent;
  let fixture: ComponentFixture<AvailableTracksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvailableTracksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvailableTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
