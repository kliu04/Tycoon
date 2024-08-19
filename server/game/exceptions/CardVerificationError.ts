class CardVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardVerificationError";
  }
}

export default CardVerificationError;
