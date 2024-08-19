class InvalidPlayerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPlayerError";
  }
}

export default InvalidPlayerError;
