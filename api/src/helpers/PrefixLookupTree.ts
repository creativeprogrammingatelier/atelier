/** A prefix lookup tree, used to e.g. find the user that is mentioned in a comment.
 * The structure is as follows, e.g. for the user named Cas:
 * { "C": { "a": { "s": { undefined: (user Cas) } } } }
 * If we have three users, Cas, Caas and Cass, the structure looks like this:
 * { "C": {
 *     "a": {
 *       "a": {
 *         "s": { match: (user Caas) }
 *       },
 *       "s": {
 *         match: (user Cas),
 *         "s": { match: (user Cass) }
 *       }
 *   }
 * }
 * A lookup is performed by traversing the tree, for example with the comment "@Cas help me!"
 * we try to look up the longest name that matches "Cas help me!": first we can match "C", which
 * returns a tree with no match value (as there is no user named "C") and a next character "a".
 * Our next character is "a", so we choose that next tree, which again has no match value and
 * next characters "a" and "s". Our next character is "s", so we choose that tree. This tree has
 * a match value (the user Cas), and a next character "s", but our next character is a space.
 * Therefore we return the last match value we encountered while traversing the tree, which in
 * this case is the match value at the last node we visited. In general, it could happen that we
 * encounter more characters that have branches down the tree, but we never reach deep enough to
 * reach another matching character. In this case the last match value will be farther up the tree.
 */
export class PrefixLookupTree<T> {
    /** The default value to choose if there are no more matching characters. */
    private match: T | undefined;
    /** Map of next character to be matched and each corresponding subtree. */
    private next: Map<string, PrefixLookupTree<T>>;

    /** Create an empty tree. Use the ofList static method instead, if you want to create
     * a tree from a list of values.
     */
    public constructor() {
        this.match = undefined;
        this.next = new Map();
    }

    /** Build a tree from a list of values.
     * @param list The values to insert into the tree.
     * @param getKey A function that returns the key for a value.
     */
    public static ofList<T>(list: T[], getKey: (value: T) => string): PrefixLookupTree<T> {
        const tree = new PrefixLookupTree<T>();
        for (const value of list) {
            tree.insert(getKey(value), value);
        }
        return tree;
    }

    /** Insert an item into the tree.
     * @param key The key to insert. Note that the key should be unique, existing items are overriden.
     * @param value The value to insert.
     */
    public insert(key: string, value: T) {
        // If the key is the empty string, then we have a match on this subtree.
        if (key === "") {
            // Thus we set the match value to the given value.
            this.match = value;
        } else {
            // Else, we traverse the tree based on the next character of the text we want to match with.
            let next = this.next.get(key[0]);
            // If there is no subtree for the next character,
            if (next === undefined) {
                // we create one
                next = new PrefixLookupTree<T>();
                // and store it in the current map of subtrees.
                this.next.set(key[0], next);
            }
            // Then we can recursively add the remainder of the key to this subtree.
            next.insert(key.slice(1), value);
        }
    }

    /** Find the longest prefix stored in the tree that matches the start of the given text. */
    public lookup(text: string): T | undefined {
        return this._lookup(text);
    }

    /** This is an internal version of lookup, which also takes the current longest match we have already found. */
    private _lookup(text: string, longestMatch?: T): T | undefined {
        // If we have no more characters to match, then this subtree is the longest possible match.
        if (text === "") {
            // If this subtree has a match value, then the text fully matches to this subtree
            if (this.match !== undefined) {
                // and thus we return the match value.
                return this.match;
            } else {
                // Else, we return the longest match that we have encountered along the way.
                return longestMatch;
            }
        } else {
            // If there is a match at the current subtree, then that is the new longest match we have found.
            const newLongest = this.match !== undefined ? this.match : longestMatch;
            // If there are characters to match, we check if there is a subtree for the next character.
            const next = this.next.get(text[0]);
            if (next === undefined) {
                // If there is no such subtree, then we cannot continue our match and so we return the longest
                // match that we encountered up to this point.
                return newLongest;
            } else {
                // If that subtree exists, we recursively call _lookup on that subtree with the remainder of the text,
                // propagating the longest match we have found so far.
                return next._lookup(text.slice(1), newLongest);
            }
        }
    }
}
