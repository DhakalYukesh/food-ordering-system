export type RegisterResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    id: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  },
  walletId: {
    id: string;
    balance: number;
  };
};

export type JWTResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
