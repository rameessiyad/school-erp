import { Test, TestingModule } from '@nestjs/testing';
import { MyClassController } from './my-class.controller';

describe('MyClassController', () => {
  let controller: MyClassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyClassController],
    }).compile();

    controller = module.get<MyClassController>(MyClassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
