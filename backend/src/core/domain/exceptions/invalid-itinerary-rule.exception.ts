export class InvalidItineraryRuleException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidItineraryRuleException';
  }
}
