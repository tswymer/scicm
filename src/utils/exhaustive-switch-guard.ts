/**
 * Guard for exhaustive matching on switch cases.
 *
 * This is a helper function to be used in switch statements to ensure that all cases are handled.
 * It is used in conjunction with the `never` type, which is a type that can never be matched.
 *
 * This should never be called, insead it is used to give use TypeScript errors on switch statements.
 *
 * @see https://medium.com/technogise/type-safe-and-exhaustive-switch-statements-aka-pattern-matching-in-typescript-e3febd433a7a
 */
const exhaustiveSwitchGuard = (matchee: never) => {
    throw new Error('Could not match ' + matchee + ' to a case.');
};

export default exhaustiveSwitchGuard;
