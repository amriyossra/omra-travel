import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterSimplePage } from './register-simple.page';

describe('RegisterSimplePage', () => {
  let component: RegisterSimplePage;
  let fixture: ComponentFixture<RegisterSimplePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterSimplePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
