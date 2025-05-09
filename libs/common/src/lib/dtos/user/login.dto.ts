import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IdentityType } from '../../enums';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  identity: string;

  @IsEnum(IdentityType)
  @IsNotEmpty()
  identityType: IdentityType;

  @IsString()
  @IsNotEmpty()
  password: string;
}
