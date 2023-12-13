import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { join } from 'https://deno.land/std@0.131.0/path/mod.ts';

console.log('main function started');

serve(async (req: Request) => {
	const url = new URL(req.url);
	const { pathname } = url;

	// handle health checks
	if (pathname === '/_internal/health') {
		return new Response(
			JSON.stringify({ 'message': 'ok' }),
			{ status: 200, headers: { 'Content-Type': 'application/json' } },
		);
	}

	const service_name = req.headers.get("x-site-name") ?? "forrageira";

	if (!service_name || service_name === '') {
		const error = { msg: 'missing function name in request' };
		return new Response(
			JSON.stringify(error),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	const servicePath = `./examples/${service_name}`;
	console.error(`serving the request with ${servicePath}`);

	const createWorker = async () => {
		const memoryLimitMb = 150;
		const workerTimeoutMs = 5 * 60 * 1000;
		const noModuleCache = false;
		// you can provide an import map inline
		const inlineImportMap = {
			'imports': {
				'$store/': './',
				'deco-sites/forrageira/': './',
				'deco/': 'https://denopkg.com/deco-cx/deco@304f189e747c5d399fdaa5fc69227cfc679e662f/',
				'$live/': 'https://denopkg.com/deco-cx/deco@304f189e747c5d399fdaa5fc69227cfc679e662f/',
				'apps/': 'https://denopkg.com/deco-cx/apps@709968ebb9f3609af42c6e8ee6c231a909071770/',
				'$fresh/': 'https://denopkg.com/mcandeia/fresh@ca827b12bbdadbc0ed7f1a6ddd7c11c8df272e95/',
				'preact': 'https://esm.sh/preact@10.19.2',
				'preact/': 'https://esm.sh/preact@10.19.2/',
				'preact-render-to-string': 'https://esm.sh/*preact-render-to-string@6.2.1',
				'@preact/signals': 'https://esm.sh/*@preact/signals@1.1.3',
				'@preact/signals-core': 'https://esm.sh/*@preact/signals-core@1.2.3',
				'std/': 'https://deno.land/std@0.190.0/',
				'partytown/': 'https://denopkg.com/deco-cx/partytown@0.4.8/',
				'daisyui': 'npm:daisyui@3.9.2',
				"twind": "https://esm.sh/twind@0.16.19",
				"twind/": "https://esm.sh/twind@0.16.19/",
				"$std/": "https://deno.land/std@0.208.0/",
				"$ga4": "https://raw.githubusercontent.com/denoland/ga4/main/mod.ts",
				"$marked-mangle": "https://esm.sh/marked-mangle@1.0.1",
				"$fresh-testing-library": "https://deno.land/x/fresh_testing_library@0.11.1/mod.ts",
				"$fresh-testing-library/": "https://deno.land/x/fresh_testing_library@0.11.1/",
				"tailwindcss": "npm:tailwindcss@3.3.5",
				"tailwindcss/": "npm:/tailwindcss@3.3.5/",
				"tailwindcss/plugin": "npm:/tailwindcss@3.3.5/plugin.js",
				"deco-sites/std/": "https://denopkg.com/deco-sites/std@1.22.11/",
			},
			'tasks': {
				'start':
					'deno task bundle && deno run -A --unstable --env --watch=tailwind.css,sections/,functions/,loaders/,actions/,workflows/,accounts/,.env dev.ts',
				'gen': 'deno run -A dev.ts --gen-only',
				'play': 'USE_LOCAL_STORAGE_ONLY=true deno task start',
				'component': 'deno eval \'import "deco/scripts/component.ts"\'',
				'release': 'deno eval \'import "deco/scripts/release.ts"\'',
				'update': 'deno run -Ar https://deco.cx/update',
				'check': 'deno fmt && deno lint && deno check dev.ts main.ts',
				'install': 'deno eval \'import "deco/scripts/apps/install.ts"\'',
				'uninstall': 'deno eval \'import "deco/scripts/apps/uninstall.ts"\'',
				'bundle':
					'deno eval \'import "deco/scripts/apps/bundle.ts"\' deco-sites/storefront',
				'cache_clean': 'rm deno.lock; deno cache -r main.ts',
				'build': 'deno run -A dev.ts build',
				'preview': 'deno run -A main.ts',
			},
			'githooks': {
				'pre-commit': 'check',
			},
			'exclude': [
				'node_modules',
				'static/',
				'README.md',
				'_fresh',
			],
			'lint': {
				'rules': {
					'tags': [
						'fresh',
						'recommended',
					],
				},
			},
			'nodeModulesDir': true,
			'compilerOptions': {
				'jsx': 'react-jsx',
				'jsxImportSource': 'preact',
			},
		};

		const importMapPath = `data:${encodeURIComponent(JSON.stringify(inlineImportMap))}?${
			encodeURIComponent(join(Deno.cwd(), servicePath))
		}`;
		// const importMapPath = join(Deno.cwd(), servicePath, 'deno.json');
		const envVarsObj = Deno.env.toObject();
		const envVars = [...Object.keys(envVarsObj).map((k) => [k, envVarsObj[k]]), [
			'DECO_SITE_NAME',
			'forrageira',
		], [
			'DENO_DEPLOYMENT_ID',
			'fake',
		]];
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
			envVars,
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
