import mongoose from 'mongoose';

/**
 * Connects to MongoDB (e.g. test or production URI from MONGODB_URI).
 */
export async function connectMongo(uri: string): Promise<void> {
	if (!uri.trim()) {
		throw new Error('MONGODB_URI is empty.');
	}
	mongoose.set('strictQuery', false);
	await mongoose.connect(uri);
	console.log(
		`[MongoDB] Connected — db: "${mongoose.connection.name}" host: ${mongoose.connection.host}`,
	);
}

export function isMongoConnected(): boolean {
	return mongoose.connection.readyState === 1;
}

export async function disconnectMongo(): Promise<void> {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
		console.log('[MongoDB] Disconnected.');
	}
}
