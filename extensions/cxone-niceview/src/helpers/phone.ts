// What counts as a phone number, in one place.
//
// Two rules depend on this and must not drift apart:
//   - the ani back-fill ACCEPTS a value as the caller's number (helpers/ani.ts)
//   - the log redactor MASKS a value because it is one (helpers/redact.ts)
// If the redactor's idea of a number were ever narrower than the back-fill's, a caller's
// number would reach the Cognigy logs. One definition means that cannot happen.

// A usable number needs at least this many digits; anything shorter is an extension,
// an internal code or a stray digit in a name.
const MIN_DIGITS = 6;

const digitCount = (value: any): number =>
    String(value === undefined || value === null ? "" : value).replace(/\D/g, "").length;

/** Enough digits to be a phone number, rather than a code, an extension or a name. */
export const hasEnoughDigits = (value: any): boolean => digitCount(value) >= MIN_DIGITS;
