class InvalidPlayerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlayerError";
    Object.setPrototypeOf(this, InvalidPlayerError.prototype);
  }
}

export default InvalidPlayerError;
