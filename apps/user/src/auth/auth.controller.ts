import {
  LoggerService,
  UserLoginDto,
  UserRegistrationDto,
} from '@food-ordering-system/common';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly logger: LoggerService,
    private readonly authService: AuthService
  ) {
    this.logger.setContext(AuthController.name);
  }

  @Post('register')
  registerUser(@Body() userRegistrationDto: UserRegistrationDto) {
    this.logger.log(`Registering user: ${JSON.stringify(userRegistrationDto)}`);

    return this.authService.registerUserAsync(userRegistrationDto);
  }

  @Post('login')
  loginUser(@Body() userLoginDto: UserLoginDto) {
    this.logger.log(`Logging in user: ${JSON.stringify(userLoginDto)}`);

    return this.authService.loginUserAsync(userLoginDto);
  }
}
