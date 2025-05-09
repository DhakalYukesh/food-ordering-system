import { IsEmail, IsNotEmpty, IsString, MinLength, Matches, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[0-9\s-]{8,}$/, { message: 'Invalid phone number format' })
  phone!: string;
  
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address!: string;

  @IsString()
  @IsNotEmpty({ message: 'Role is required' })
  @IsIn(['customer', 'seller', 'admin'], { message: 'Role must be included' })
  role!: string;
}
