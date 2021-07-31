/** Error that gets thrown if an invalid UUID presentation is encoutered */
export class UUIDError extends Error {
	constructor(id: string) {
		super(`${id} is not a valid base64 representation of a UUID.`);
	}
}

export class UUIDHelper {
	/**
	 * Convert a 22-character base 64 ID to the database internal UUID.
	 * We use _ instead of the base 64 / and - instead of +
	 */
	static toUUID(id: string): UUID;
	static toUUID(id: null | undefined): undefined;
	static toUUID(id: string | null | undefined): UUID | undefined;
	static toUUID(id: string | null | undefined): UUID | undefined {
		if (id === undefined || id === null) {
			return undefined;
		}
		if (id.length !== 22) {
			throw new UUIDError(id);
		}

		const buffer = Buffer.from(id.replace(/_/g, '/').replace(/-/g, '+'), 'base64');
		const hex = buffer.toString('hex');
		const result = hex.substr(0, 8) + '-' + hex.substr(8, 4) + '-' + hex.substr(12, 4) + '-' + hex.substr(16, 4) + '-' + hex.substr(20, 12);

		if (this.fromUUID(result) !== id){
			console.log(98765, id);
			throw new UUIDError(id);
		}
		return result;
	}

  /**
	 * Convert the internal database UUID to a 22-character shorter base 64 id.
	 * We use _ instead of the base 64 / and - instead of +
	 */
	static fromUUID(uuid: undefined): undefined;
	static fromUUID(uuid: UUID): ID64;
	static fromUUID(uuid: UUID | undefined): ID64 | undefined;
	static fromUUID(uuid: UUID | undefined): ID64 | undefined {
		if (uuid === undefined || uuid === null) {
			return undefined;
		}
		
		const hex = uuid.replace(/-/g, "");
		const buffer = Buffer.from(hex, "hex");
		
		return buffer.toString("base64").replace(/\//g, "_").replace(/\+/g, "-").substr(0, 22);
	}
}

export type UUID = string;
export type ID64 = string;