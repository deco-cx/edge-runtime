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

	const servicePath = `./examples/forrageira`;

	const createWorker = async () => {
		const memoryLimitMb = 150;
		const workerTimeoutMs = 5 * 60 * 1000;
		const noModuleCache = false;
		// you can provide an import map inline
		const inlineImportMap = {
			'imports': {
				'apps/':
					'../../../apps/',
				'deco-sites/forrageira/': './',
				'$live/': '../../../deco/',
				'deco-sites/std/': 'https://denopkg.com/deco-sites/std@1.24.2/',
				'partytown/': 'https://deno.land/x/partytown@0.4.8/',
				'$fresh/': '../../../fresh/',
				'preact': 'https://esm.sh/preact@10.15.1',
				'preact/': 'https://esm.sh/preact@10.15.1/',
				'preact-render-to-string': 'https://esm.sh/*preact-render-to-string@6.2.0',
				'@preact/signals': 'https://esm.sh/*@preact/signals@1.1.3',
				'@preact/signals-core': 'https://esm.sh/@preact/signals-core@1.3.0',
				'twind': 'https://esm.sh/v117/twind@0.16.17',
				'twind/': 'https://esm.sh/v117/twind@0.16.17/',
				'std/': 'https://deno.land/std@0.178.0/',
				'prefetch': 'https://deno.land/x/prefetch@0.0.6/mod.ts',
				'deco/': '../../../deco/',
			},
		};
		const importMapPath = `data:${encodeURIComponent(JSON.stringify(inlineImportMap))}?${
			encodeURIComponent(`${Deno.cwd()}/examples/forrageira`)
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
			envVars: [...envVars, ["DECO_SITE_NAME", "forrageira"]],
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
