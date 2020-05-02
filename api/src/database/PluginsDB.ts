import {PluginInput, convertPlugin, Plugin} from "../../../models/database/Plugin";
import {convertPluginHook, PluginHookInput} from "../../../models/database/PluginHook";
import {UUIDHelper} from "../helpers/UUIDHelper";
import {logger} from "../helpers/LoggingHelper";
import {checkAvailable, pool, pgDB, extract, map, one} from "./HelperDB";

export class PluginsDB {
	static async getRelevantPlugins(courseID: string, hook: string, client: pgDB = pool) {
		const courseid = UUIDHelper.toUUID(courseID);
		return client.query(`
			SELECT p.*
			FROM "CourseRegistration" as cr, "Plugins" as p, "PluginHooks" as ph
			WHERE cr.courseID = $1
			 AND cr.userID = p.pluginID
			 AND p.pluginID = ph.pluginID
			 AND ph.hook = $2
		`, [courseid, hook]).then(extract).then(map(convertPlugin));
	}
	
	static async filterPlugins(plugin: PluginInput) {
		const {
			pluginID = undefined,
			publicKey = undefined,
			webhookSecret = undefined,
			webhookUrl = undefined,
			
			limit = undefined,
			offset = undefined,
			client = pool
		} = plugin;
		const pluginid = UUIDHelper.toUUID(pluginID);
		return client.query(`
			SELECT *
			FROM "Plugins"
			WHERE
				($1::uuid IS NULL OR pluginID=$1)
			AND ($2::text IS NULL OR publicKey=$2)
			AND ($3::text IS NULL OR webhookSecret=$3)
			AND ($2::text IS NULL OR webhookUrl=$4)
			ORDER BY pluginID
			LIMIT $5
			OFFSET $6
		`, [pluginid, publicKey, webhookSecret, webhookUrl, limit, offset])
			.then(extract).then(map(convertPlugin));
	}
	
	static async addPlugin(plugin: PluginInput) {
		checkAvailable(["pluginID", "publicKey", "webhookSecret", "webhookUrl"], plugin);
		const {
			pluginID,
			webhookUrl,
			webhookSecret,
			publicKey,
			
			client = pool
		} = plugin;
		const pluginid = UUIDHelper.toUUID(pluginID);
		return client.query(`
		INSERT INTO "Plugins" VALUES
			($1,$2,$3,$4)
		RETURNING *
		`, [pluginid, webhookUrl, webhookSecret, publicKey])
			.then(extract).then(map(convertPlugin)).then(one);
	}
	static async updatePlugin(plugin: PluginInput) {
		checkAvailable(["pluginID"], plugin);
		const {
			pluginID,
			webhookUrl = undefined,
			webhookSecret = undefined,
			publicKey = undefined,
			
			client = pool
		} = plugin;
		const pluginid = UUIDHelper.toUUID(pluginID);
		return client.query(`
		UPDATE "Plugins" SET
		webhookUrl = COALESCE($2, webhookUrl),
		webhookSecret = COALESCE($3, webhookSecret),
		publicKey = COALESCE($4, publicKey)
		WHERE 
			pluginID = $1
		RETURNING *
		`, [pluginid, webhookUrl, webhookSecret, publicKey])
			.then(extract).then(map(convertPlugin)).then(one);
	}
	static async deletePlugin(pluginID: string, client: pgDB = pool) {
		logger.warn("using this delete probably doesn't do what you want. \n\
By deleting the user associated with this plugin, the plugin will be deleted as well.");
		const pluginid = UUIDHelper.toUUID(pluginID);
		return client.query(`
			DELETE FROM "Plugins"
			WHERE pluginID = $1
			RETURNING *
		`, [pluginid])
			.then(extract).then(map(convertPlugin)).then(one);
	}
	
	static async filterHooks(pluginHook: PluginHookInput) {
		const {
			pluginID = undefined,
			hook = undefined,
			client = pool
		} = pluginHook;
		const pluginid = UUIDHelper.toUUID(pluginID);
		return client.query(`
			SELECT * 
			FROM "PluginHooks"
			WHERE
				($1::uuid IS NULL OR pluginID = $1)
			AND ($2::text IS NULL OR hook = $2)
		`, [pluginid, hook]).then(extract).then(map(convertPluginHook));
	}
	
	static async addHook(pluginHook: PluginHookInput) {
		checkAvailable(["pluginID", "hook"], pluginHook);
		const {
			pluginID,
			hook,
			client = pool
		} = pluginHook;
		const pluginid = UUIDHelper.toUUID(pluginID);
		return client.query(`
			INSERT INTO "PluginHooks"
			VALUES ($1,$2)
			RETURNING *
		`, [pluginid, hook])
			.then(extract).then(map(convertPluginHook)).then(one);
	}
	static async deleteHook(pluginHook: PluginHookInput) {
		checkAvailable(["pluginID", "hook"], pluginHook);
		const {
			pluginID,
			hook,
			client = pool
		} = pluginHook;
		const pluginid = UUIDHelper.toUUID(pluginID);
		return client.query(`
			DELETE FROM "PluginHooks"
			WHERE pluginID = $1
			 AND hook = $2
			RETURNING *
		`, [pluginid, hook])
			.then(extract).then(map(convertPluginHook)).then(one);
	}
	static async addHooks(plugin: Plugin): Promise<Plugin & {hooks: string[]}> {
		const hooks = await this.filterHooks({pluginID: plugin.pluginID});
		const list = hooks.map(el => el.hook);
		return {...plugin, hooks: list};
	}
}