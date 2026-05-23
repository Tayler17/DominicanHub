import { IsString, IsNumber, IsOptional, IsEnum, IsPositive, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ example: 'Samsung S24 Case' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Funda Samsung S24' })
  @IsString()
  @IsOptional()
  nameEs?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descriptionEs?: string;

  @ApiProperty({ example: 25.99 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ example: 29.99 })
  @IsNumber()
  @IsOptional()
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @ApiPropertyOptional({ example: '3926.90' })
  @IsString()
  @IsOptional()
  hsCode?: string;

  @ApiPropertyOptional({ example: 'CN' })
  @IsString()
  @IsOptional()
  originCountry?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQty?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;
}
