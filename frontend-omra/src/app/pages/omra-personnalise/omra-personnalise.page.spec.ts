import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OmraPersonnalisePage } from './omra-personnalise.page';

describe('OmraPersonnalisePage', () => {
  let component: OmraPersonnalisePage;
  let fixture: ComponentFixture<OmraPersonnalisePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OmraPersonnalisePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
