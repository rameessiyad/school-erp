import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ImportTargetDto } from './dto/student-import.dto';
import { StudentImportService } from './student-import.service';
import { UploadedExcelFile } from './student-import.helpers';

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const upload = FileInterceptor('file', {
  limits: { fileSize: 5 * 1024 * 1024 },
});

const toFile = (r: { buffer: Buffer; filename: string }) =>
  new StreamableFile(r.buffer, {
    type: XLSX_MIME,
    disposition: `attachment; filename="${r.filename}"`,
  });

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SCHOOL_ADMIN)
@Controller('student-import')
export class StudentImportController {
  constructor(private service: StudentImportService) {}

  @Get('options')
  options(@Request() req) {
    return this.service.getOptions(req.user.schoolId);
  }

  @Get('template')
  async template(@Request() req, @Query() q: ImportTargetDto) {
    return toFile(
      await this.service.buildTemplate(
        req.user.schoolId,
        q.academicYearId,
        q.sectionId,
      ),
    );
  }

  @Post('validate')
  @UseInterceptors(upload)
  validate(
    @Request() req,
    @Body() dto: ImportTargetDto,
    @UploadedFile() file: UploadedExcelFile,
  ) {
    return this.service.validate(
      req.user.schoolId,
      dto.academicYearId,
      dto.sectionId,
      file,
    );
  }

  @Post('error-report')
  @UseInterceptors(upload)
  async errorReport(
    @Request() req,
    @Body() dto: ImportTargetDto,
    @UploadedFile() file: UploadedExcelFile,
  ) {
    return toFile(
      await this.service.buildErrorReport(
        req.user.schoolId,
        dto.academicYearId,
        dto.sectionId,
        file,
      ),
    );
  }

  @Post('commit')
  @UseInterceptors(upload)
  commit(
    @Request() req,
    @Body() dto: ImportTargetDto,
    @UploadedFile() file: UploadedExcelFile,
  ) {
    return this.service.commit(
      req.user.schoolId,
      dto.academicYearId,
      dto.sectionId,
      file,
    );
  }
}
