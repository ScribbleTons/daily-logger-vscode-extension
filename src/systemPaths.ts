import * as os from 'os';

export function getUserHome(): string {
    return os.homedir();
}