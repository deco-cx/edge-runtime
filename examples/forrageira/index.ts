/// <reference no-default-lib="true"/>
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="esnext" />

import twindPlugin from "$fresh/plugins/twind.ts";
import { start } from "$fresh/server.ts";
import decoPlugin from "$live/plugins/deco.ts";
import twindConfig from "deco-sites/forrageira/twind.config.ts";
import partytownPlugin from "partytown/mod.ts";
import manifest from "./fresh.gen.ts";
import decoManifest from "./manifest.gen.ts";

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

await start(manifest, {
  plugins: [
    decoPlugin({
      manifest: decoManifest,
    }),
    twindPlugin({
      ...twindConfig,
      selfURL: new URL("./twind.config.ts", import.meta.url).href,
    }),
    partytownPlugin(),
  ],
});
