import {pgDB} from "../HelperDB";
import {TagsDB} from "../TagsDB";
import {Tag} from "../../../../models/api/Tag";


/** Get the parts of the a comment following the #-sign, which starts a tag */
export function getPossibleTags(commentBody: string): string[] {
	return commentBody.split(" ").filter(text => text[0] == "#").map(tag => tag.substr(1).trim());
}

/** Creates the tags for a comment */
export async function createTags(commentBody: string, commentID: string, client?: pgDB) {
	const tags = getPossibleTags(commentBody);
	const dbTags = await Promise.all(tags.map(t => {
		return TagsDB.addTag({
			tagbody: t,
			commentID,
			client
		});
	}));
	return dbTags.filter(t => t !== undefined) as Tag[];
}