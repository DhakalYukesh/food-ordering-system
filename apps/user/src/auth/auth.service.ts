import {
  IdentityType,
  JWTResponse,
  JwtServiceName,
  LoggerService,
  RegisterResponse,
  SuccessResponse,
  UserLoginDto,
  UserRegistrationDto,
} from '@food-ordering-system/common';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user-management/entities/user.entity';
import { Repository } from 'typeorm';
import { UserAddress } from '../user-management/entities/address.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@food-ordering-system/configs';
import { UserSession } from './entities/session.entity';
import { WalletRmqCommunication } from '../rmq-communication/wallet.communicate';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly walletCommunicateService: WalletRmqCommunication,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,

    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,

    @Inject(JwtServiceName.JWT_ACCESS_SERVICE)
    private accessTokenService: JwtService,

    @Inject(JwtServiceName.JWT_REFRESH_SERVICE)
    private refreshTokenService: JwtService
  ) {
    this.logger.setContext(AuthService.name);
  }

  async registerUserAsync(
    userRegistrationDto: UserRegistrationDto
  ): Promise<SuccessResponse<RegisterResponse>> {
    try {
      // Step 1: Check if the user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: userRegistrationDto.email },
      });

      if (existingUser) {
        this.logger.warn('User already exists');
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      // Step 2: Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        userRegistrationDto.password,
        salt
      );

      // Step 3: User and address creation
      // Create a new UserAddress entity and assign the address properties
      const userAddress = new UserAddress();
      Object.assign(userAddress, userRegistrationDto.address);

      const user = new User();
      Object.assign(user, userRegistrationDto);
      user.password = hashedPassword;
      user.address = userAddress;

      // Step 4: Save the user, which will cascade save the address
      const savedUser = await this.userRepository.save(user);

      if (!savedUser) {
        this.logger.error('Error saving user');
        throw new HttpException(
          'Error saving user',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Step 5: Create a wallet for the user
      const walletResponse = await this.walletCommunicateService.createWallet(
        savedUser.id,
        0
      );

      if (!walletResponse) {
        this.logger.error('Error creating wallet');
        throw new HttpException(
          'Error creating wallet',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      // Step 6: Save the wallet ID in the user entity
      savedUser.walletId = walletResponse.id;
      const savedUserWithWallet = await this.userRepository.save(savedUser);

      if (!savedUserWithWallet) {
        this.logger.error('Error saving user with wallet');
        throw new HttpException(
          'Error saving user with wallet',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      this.logger.log('User, Wallet and address saved successfully');

      // Step 5: Return the saved user and address
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
          walletId: {
            id: walletResponse.id,
            balance: walletResponse.balance,
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

  async loginUserAsync(
    userLoginDto: UserLoginDto
  ): Promise<SuccessResponse<JWTResponse>> {
    const { identity, identityType, password } = userLoginDto;
    this.logger.log(
      `Login attempt with ${identityType}: ${identity} and password: ${password}`
    );
    try {
      // Step 1: Find the user by email or username or phone
      const userRecord = await this.findUserByIdentity(identity, identityType);

      // Step 2: Verify the password
      const isPasswordValid = await bcrypt.compare(
        password,
        userRecord.password
      );

      if (!isPasswordValid) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      // Step 3: Generate a JWT token and response back
      const generatedToken = await this.generateJwtToken(userRecord);

      this.logger.log('User logged in successfully');

      return {
        statusCode: HttpStatus.OK,
        message: 'User logged in successfully',
        data: generatedToken,
      };
    } catch (error) {
      this.logger.error('Error logging in user', error);
      throw new HttpException(
        error.message || 'Error logging in user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async findUserByIdentity(
    identity: string,
    identityType: IdentityType
  ): Promise<User> {
    let userRecord = null;
    try {
      if (identityType === IdentityType.EMAIL) {
        userRecord = await this.userRepository.findOne({
          where: { email: identity },
        });

        if (!userRecord) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }

      if (identityType === IdentityType.USERNAME) {
        userRecord = await this.userRepository.findOne({
          where: { userName: identity },
        });

        if (!userRecord) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }

      if (identityType === IdentityType.PHONE) {
        userRecord = await this.userRepository.findOne({
          where: { phone: identity },
        });

        if (!userRecord) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      }

      this.logger.log(`User found with ${identityType}: ${identity}`);

      return userRecord;
    } catch (error) {
      this.logger.error('Error finding user', error);
      throw new HttpException(
        error.message || 'Error finding user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async generateJwtToken(user: User): Promise<JWTResponse> {
    try {
      this.logger.log('Generating JWT token');

      // Step 1: Payload for access token
      const payloadForAccessToken = {
        sub: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };

      const accessToken = await this.accessTokenService.signAsync(
        payloadForAccessToken
      );
      const refreshToken = await this.refreshTokenService.signAsync({
        sub: user.id,
      });
      const { jwtAccessExpiration } = this.configService.getJwtConfig();

      if (!accessToken || !refreshToken) {
        throw new HttpException(
          'Error generating tokens',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      this.logger.log('Access and refresh tokens generated successfully');

      // Step 2: Save the refresh token in the database
      const userSession = new UserSession();
      userSession.userId = user.id;
      userSession.refreshToken = refreshToken;
      userSession.expiresAt = new Date(
        Date.now() + parseInt(jwtAccessExpiration) * 1000
      );

      const savedSession = await this.userSessionRepository.save(userSession);

      if (!savedSession) {
        throw new HttpException(
          'Error saving user session',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }

      this.logger.log('User session saved successfully');

      // Step 3: Return the access token
      return {
        accessToken,
        refreshToken,
        expiresIn: jwtAccessExpiration,
      };
    } catch (error) {
      this.logger.error('Error generating JWT token', error);
      throw new HttpException(
        error.message || 'Error generating JWT token',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
