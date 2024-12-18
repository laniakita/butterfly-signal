export interface Config {
	REVALIDATE: number;
	DEBUG: boolean;
}

export const DEFAULT_CONFIG: Config = {
	REVALIDATE: 3600, // todo: change back to 3600
	DEBUG: true // todo: change back to false
};

//todo function to save/update config
export const CUSTOM_CONFIG = null;

export const CONFIG: Config = CUSTOM_CONFIG ?? DEFAULT_CONFIG;
