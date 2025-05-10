import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateFoodItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;
}
