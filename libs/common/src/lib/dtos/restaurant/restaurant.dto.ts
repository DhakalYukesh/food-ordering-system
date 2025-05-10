import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsUrl()
  @IsNotEmpty()
  googleMapUrl: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @IsUUID()
  @IsOptional()
  ownerId?: string;
}
