import {Tag, tagToAPI} from '../../../models/database/Tag';

import {UUIDHelper} from './helpers/UUIDHelper';

import {pool, extract, map, one, checkAvailable} from './HelperDB';
import {TagsView} from './ViewsDB';

export class TagsDB {
  /**
	 * Adds a Tag to the database
	 * @param tag
	 */
  static async addTag(tag: Tag) {
    checkAvailable(['commentID', 'tagbody'], tag);
    const {
      commentID,
      tagbody,
      client = pool,
    } = tag;
    const commentid = UUIDHelper.toUUID(commentID);
    return client.query(`
		WITH insert AS (
			INSERT INTO "Tags"
			VALUES (DEFAULT, $1, $2)
			RETURNING *
		)
		${TagsView('insert')}
		`, [commentid, tagbody])
        .then(extract).then(map(tagToAPI)).then(one);
  }

  /**
	 * gets the most used tags from the database
	 * @param amount
	 */
  static async getMostUsedTags(amount: number) {
    return pool.query(`
		SELECT g.*
		FROM (
   			SELECT  f.* ,
   			RANK () OVER ( 
				PARTITION BY f.tagbody
				ORDER BY f.count DESC
			) rank_number 
 			FROM (
        		SELECT v.*, 
        		COUNT(v.tagbody) OVER (
           			PARTITION BY v.tagbody
					ORDER BY tagid DESC
       			)
        		FROM "TagsView" as v
    		) f
		) g
		WHERE g.rank_number =1
		ORDER BY count DESC
		LIMIT $1
        `, [amount])
        .then(extract).then(map(tagToAPI));
  }
}
