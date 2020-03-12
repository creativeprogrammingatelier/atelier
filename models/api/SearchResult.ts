import { User } from "./User";
import { Comment } from './Comment';
import { Snippet } from "./Snippet";

export interface SearchResult {
    users: User[],
    comments: Comment[],
    snippets: Snippet[]
}