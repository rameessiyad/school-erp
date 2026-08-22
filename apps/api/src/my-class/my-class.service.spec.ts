import { Test, TestingModule } from '@nestjs/testing';
import { MyClassService } from './my-class.service';

describe('MyClassService', () => {
  let service: MyClassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyClassService],
    }).compile();

    service = module.get<MyClassService>(MyClassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
