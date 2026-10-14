import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormWrapper } from './form-wrapper';

describe('FormWrapper', () => {
  let component: FormWrapper;
  let fixture: ComponentFixture<FormWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormWrapper],
    }).compileComponents();

    fixture = TestBed.createComponent(FormWrapper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
