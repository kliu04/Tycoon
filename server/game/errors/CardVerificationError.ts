/**
 * Error thrown for illegal moves
 */
class CardVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CardVerificationError";
    Object.setPrototypeOf(this, CardVerificationError.prototype);
  }
}

export default CardVerificationError;
