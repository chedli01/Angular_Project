export interface ConnectedUser {
  id: string;
  email: string;
  name?: string;
}

export interface UserSignup {
  name: string;
  email: string;
  password: string;
}
