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
  };
};
