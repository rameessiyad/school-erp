import { Test, TestingModule } from '@nestjs/testing';
import { StaffDesignationController } from './staff-designation.controller';

describe('StaffDesignationController', () => {
  let controller: StaffDesignationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffDesignationController],
    }).compile();

    controller = module.get<StaffDesignationController>(StaffDesignationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
