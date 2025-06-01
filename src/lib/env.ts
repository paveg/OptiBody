import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const env = {
	DATABASE_URL:
		process.env.DATABASE_URL ||
		"postgresql://optibody:optibody_dev_password@localhost:5432/optibody",
	SESSION_SECRET:
		process.env.SESSION_SECRET || "dev-secret-change-in-production",
	NODE_ENV: process.env.NODE_ENV || "development",
};
