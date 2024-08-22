class StateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "State Error";
    Object.setPrototypeOf(this, StateError.prototype);
  }
}

export default StateError;
