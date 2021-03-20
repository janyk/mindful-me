export default class RecoveryDataException extends Error {
  constructor(message = '') {
    super(message)
    this.name = 'RecoveryDataException'
  }
}
