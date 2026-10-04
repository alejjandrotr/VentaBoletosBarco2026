export class InvalidEmailException extends Error {
  constructor(email: string) {
    super(`El correo electrónico '${email}' no es un correo válido para facturación.`);
    this.name = 'InvalidEmailException';
  }
}
