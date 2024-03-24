console.log('main function started!!');

Deno.serve((req: Request) => {
	const url = new URL(req.url);
	const { pathname } = url;

	// handle health checks
	if (pathname === '/_internal/health') {
		return new Response(
			JSON.stringify({ 'message': 'ok' }),
			{ status: 200, headers: { 'Content-Type': 'application/json' } },
		);
	}

	const servicePath = `./examples/storefront`;

	const createWorker = async () => {
		const memoryLimitMb = 150;
		const workerTimeoutMs = 5 * 60 * 1000;
		const noModuleCache = false;
		// you can provide an import map inline
		const inlineImportMap = {
			'imports': {
				'deco/': 'https://denopkg.com/deco-cx/deco@1.57.28/',
				'apps/': 'https://denopkg.com/deco-cx/apps@0.35.14/',
				'$fresh/': 'https://deno.land/x/fresh@1.6.5/',
				'preact': 'https://esm.sh/preact@10.19.2',
				'preact/': 'https://esm.sh/preact@10.19.2/',
				'preact-render-to-string': 'https://esm.sh/*preact-render-to-string@6.2.2',
				'@preact/signals': 'https://esm.sh/*@preact/signals@1.2.1',
				'@preact/signals-core': 'https://esm.sh/*@preact/signals-core@1.5.0',
				'std/': 'https://deno.land/std@0.190.0/',
				'partytown/': 'https://denopkg.com/deco-cx/partytown@0.4.8/',
				'daisyui': 'npm:daisyui@4.6.0',
			},
		};
		const importMapPath = `data:${encodeURIComponent(JSON.stringify(inlineImportMap))}?${
			encodeURIComponent(`${Deno.cwd()}/examples/storefront`)
		}`;
		const envVarsObj = Deno.env.toObject();
		const envVars = Object.keys(envVarsObj).map((k) => [k, envVarsObj[k]]);
		const forceCreate = false;
		const netAccessDisabled = false;

		// load source from an eszip
		//const maybeEszip = await Deno.readFile('./bin.eszip');
		//const maybeEntrypoint = 'file:///src/index.ts';

		// const maybeEntrypoint = 'file:///src/index.ts';
		// or load module source from an inline module
		// const maybeModuleCode = 'Deno.serve((req) => new Response("Hello from Module Code"));';
		//
		const cpuTimeSoftLimitMs = 50;
		const cpuTimeHardLimitMs = 100;

		return await EdgeRuntime.userWorkers.create({
			servicePath,
			memoryLimitMb,
			workerTimeoutMs,
			noModuleCache,
			importMapPath,
			envVars: [...envVars, ['FRESH_ESBUILD_LOADER', 'portable'], [
				'DECO_SITE_NAME',
				'storefront',
			]],
			forceCreate,
			netAccessDisabled,
			cpuTimeSoftLimitMs,
			cpuTimeHardLimitMs,
			// maybeEszip,
			// maybeEntrypoint,
			// maybeModuleCode,
		});
	};

	const callWorker = async () => {
		try {
			// If a worker for the given service path already exists,
			// it will be reused by default.
			// Update forceCreate option in createWorker to force create a new worker for each request.
			const worker = await createWorker();
			const controller = new AbortController();

			const signal = controller.signal;
			// Optional: abort the request after a timeout
			//setTimeout(() => controller.abort(), 2 * 60 * 1000);

			return await worker.fetch(req, { signal });
		} catch (e) {
			console.error(e);
			const error = { msg: e.toString() };
			return new Response(
				JSON.stringify(error),
				{ status: 500, headers: { 'Content-Type': 'application/json' } },
			);
		}
	};

	return callWorker();
});
