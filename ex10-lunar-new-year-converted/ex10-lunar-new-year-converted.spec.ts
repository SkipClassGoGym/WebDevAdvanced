import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { Ex10LunarNewYearConverted } from './ex10-lunar-new-year-converted';

describe('Ex10LunarNewYearConverted', () => {
  let component: Ex10LunarNewYearConverted;
  let fixture: ComponentFixture<Ex10LunarNewYearConverted>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Ex10LunarNewYearConverted],
      imports: [FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ex10LunarNewYearConverted);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
