import { Controller, Get, Query, UseGuards, Headers } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('reportes')
@UseGuards(SupabaseAuthGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

    @Get('estres')
    getReporteEstres(
    @User() user: { id: string },
    @Headers('authorization') authHeader: string,
    ) {
    const accessToken = authHeader.split(' ')[1];
    return this.reportesService.getReporteEstres(user.id, accessToken);
    }

    @Get('recomendacion')
    getRecomendacion(@User() user: { id: string }) {
      return this.reportesService.getRecomendacionPersonalizada(user.id);
    }
}
