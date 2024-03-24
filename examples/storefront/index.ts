/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import { start } from '$fresh/server.ts';
import config from './fresh.config.ts';
import manifest from './fresh.gen.ts';
class PromiseWithResolvers<T> {
	promise: Promise<T>;
	resolve!: (value: T | PromiseLike<T>) => void;
	reject!: (reason?: any) => void;

	constructor() {
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolve = resolve;
			this.reject = reject;
		});
	}
}

function withResolvers<T>(): {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: any) => void;
} {
	const promiseWithResolvers = new PromiseWithResolvers<T>();
	return {
		promise: promiseWithResolvers.promise,
		resolve: promiseWithResolvers.resolve,
		reject: promiseWithResolvers.reject,
	};
}

Promise.withResolvers = Promise.withResolvers ?? withResolvers;

await start(manifest, config);
