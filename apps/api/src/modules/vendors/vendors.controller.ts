import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create vendor account' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateVendorDto) {
    return this.vendorsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  findAll() { return this.vendorsService.findAll(); }

  @Get('me/dashboard')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vendor dashboard' })
  getDashboard(@CurrentUser('id') userId: string) {
    return this.vendorsService.getDashboard(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  findOne(@Param('id') id: string) { return this.vendorsService.findOne(id); }
}
