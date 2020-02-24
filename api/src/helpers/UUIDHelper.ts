export class UUIDHelper {
	static toUUID(id: string) {
		/*
			Convert a 22-character base 64 ID to the database internal UUID.
			We use _ instead of the base 64 /
		 */
		const buffer = Buffer.from(id.replace(/_/, "/"), "base64");
		const hex = buffer.toString("hex");

		return hex.substr(0, 8) + "-" + hex.substr(8, 4) + "-" + hex.substr(12, 4) + "-" + hex.substr(16, 4) + "-" + hex.substr(20, 12);
	}
	static fromUUID(uuid: string) {
		/*
			Convert the internal database UUID to a 22-character shorter base 64 id.
			We use _ instead of the base 64 /
		 */
		const hex = uuid.replace(/-/g, "");
		const buffer = Buffer.from(hex, "hex");

		return buffer.toString("base64").replace(/\//, "_").substr(0, 22);
	}
}