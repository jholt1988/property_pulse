import { IsOptional, IsString } from 'class-validator';

export class VoidEnvelopeDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

