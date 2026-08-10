import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { StaffModule } from './staff/staff.module';
import { SubjectModule } from './subject/subject.module';
import { TeacherModule } from './teacher/teacher.module';
import { AcademicYearModule } from './academic-year/academic-year.module';
import { ClassModule } from './class/class.module';
import { SectionModule } from './section/section.module';
import { StudentModule } from './student/student.module';
import { ParentModule } from './parent/parent.module';
import jwtConfig from './config/jwt.config';
import { RedisModule } from './redis/redis.module';
import { FeesModule } from './fees/fees.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { FileUploadModule } from './file-upload/file-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StaffModule,
    SubjectModule,
    TeacherModule,
    AcademicYearModule,
    ClassModule,
    SectionModule,
    StudentModule,
    ParentModule,
    RedisModule,
    FeesModule,
    DashboardModule,
    FileUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
