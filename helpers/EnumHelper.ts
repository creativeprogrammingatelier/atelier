/**
 * A function to make sure a value is contained in an enum, this returns the correct enum value
 * If the given enum is of type <string>=<sameString>, this function can be used multiple times without issue.
 *
 * @param enumer the enum to select an item from
 * @param item the (maybe) item to be selected
 * @throws if the given item is not part of the given enumeration.
 */
export function getEnum<T>(enumer: T, item: string) {
    if (checkEnum(enumer, item)) {
        return enumer[item];
    } else {
        const items = "{" + Object.keys(enumer).join(", ") + "}";
        throw new EnumError("item `" + item + "` was expected to be part of the enum " + items + ", but wasn't");
    }
}

export function checkEnum<T>(enumer: T, item: string | number | symbol): item is keyof typeof enumer {
    return item in enumer;
}

//this function adds `item` to enum( : any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addItem(enumer: any, item: string): void {
    if (item in enumer) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new EnumError(`tried to add an item to an enum that was already there: ${item}, enum entries: ${enumer}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    enumer[item] = item;
}

//this function removes `item` from enum( : any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function removeItem(enumer: any, item: string): void {
    if (!(item in enumer)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new EnumError(`tried to remove an item from an enum that was not there: ${item}, enum entries: ${enumer}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete enumer[item];
}
/**
 * error class to differentiate errors thrown by this module
 */
export class EnumError extends Error {
    constructor(message = "expected a value to be a member of an enum, but this was not the case") {
        super(message);
    }
}
