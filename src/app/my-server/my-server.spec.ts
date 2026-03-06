import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyServer } from './my-server';

describe('MyServer', () => {
  let component: MyServer;
  let fixture: ComponentFixture<MyServer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyServer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyServer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
