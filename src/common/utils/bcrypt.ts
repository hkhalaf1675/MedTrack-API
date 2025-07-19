import { genSalt, hash, compare } from 'bcrypt';

/**
 * Hashes a plain text using bcrypt.
 * 
 * @param text - the text to be hashed
 * @param saltRounds - the number of rounds to use for generating the salt, default is 10
 * @returns a hashed string
 */
export const hashText = async (text: string, saltRounds: number = 10): Promise<string> => {
    const salt = await genSalt(saltRounds);

    return hash(text, salt);
}

/**
 * Compares plain text to a hashed string using bcrypt.
 * 
 * @param text - the plain text to compare
 * @param hashedText - the hashed text to compare with
 * @returns true if they match, false otherwise 
 */
export const compareText = async (text: string, hashedText: string): Promise<boolean> => {
    return compare(text, hashedText);
}