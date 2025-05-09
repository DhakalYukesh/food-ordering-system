import {
  LoggerService,
  RegisterResponse,
  SuccessResponse,
  UserRegistrationDto,
} from '@food-ordering-system/common';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user-management/entities/user.entity';
import { Repository } from 'typeorm';
import { UserAddress } from '../user-management/entities/address.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>
  ) {
    this.logger.setContext(AuthService.name);
  }

  async registerUserAsync(
    userRegistrationDto: UserRegistrationDto
  ): Promise<SuccessResponse<RegisterResponse>> {
    try {
      // Step 1: Create the address entity and assign values
      const userAddress = new UserAddress();
      Object.assign(userAddress, userRegistrationDto.address);

      const user = new User();
      Object.assign(user, userRegistrationDto);
      user.address = userAddress;

      // Step 2: Save the user, which will cascade save the address
      const savedUser = await this.userRepository.save(user);

      if (!savedUser) {
        this.logger.error('Error saving user');
        throw new HttpException(
          'Error saving user',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      this.logger.log('User and address saved successfully');

      // Step 3: Return the saved user and address
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User registered successfully',
        data: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          phone: savedUser.phone,
          address: {
            id: savedUser.address.id,
            city: savedUser.address.city,
            state: savedUser.address.state,
            zipCode: savedUser.address.zipCode,
            country: savedUser.address.country,
          },
        },
      };
    } catch (error) {
      this.logger.error('Error registering user', error);
      throw new HttpException(
        error.message || 'Error registering user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
