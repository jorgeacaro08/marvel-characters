import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export enum CharacterStatus {
  ACTIVE = 'ACTIVE',
  INJURED = 'INJURED',
  MISSING = 'MISSING',
  RETIRED = 'RETIRED',
}

export class CharacterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  real_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  alias: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  main_power: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(100)
  power_level: number;

  @ApiPropertyOptional({ enum: CharacterStatus })
  @IsOptional()
  @IsEnum(CharacterStatus)
  status?: CharacterStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_villain?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  team_id?: number;
}

export class StatusDto {
  @ApiProperty({ enum: CharacterStatus })
  @IsEnum(CharacterStatus)
  status: CharacterStatus;
}
