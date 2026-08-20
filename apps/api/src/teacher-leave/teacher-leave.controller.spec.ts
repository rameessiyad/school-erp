import { Test, TestingModule } from '@nestjs/testing';
import { TeacherLeaveController } from './teacher-leave.controller';

describe('TeacherLeaveController', () => {
  let controller: TeacherLeaveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeacherLeaveController],
    }).compile();

    controller = module.get<TeacherLeaveController>(TeacherLeaveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
