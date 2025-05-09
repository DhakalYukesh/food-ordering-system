import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hey there! Welcome to Food Ordering System 🍉 - User API Service!' };
  }
}