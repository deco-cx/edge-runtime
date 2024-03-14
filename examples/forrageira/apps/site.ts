import { App } from "$live/mod.ts";
import website, { Props as WebSiteProps } from "apps/website/mod.ts";
import manifest, { Manifest } from "../manifest.gen.ts";

export default function Site(
  state: WebSiteProps,
): App<Manifest, WebSiteProps, [ReturnType<typeof website>]> {
  const websiteApp = website(state);
  return {
    state,
    manifest,
    dependencies: [
      websiteApp,
    ],
  };
}

export { onBeforeResolveProps } from "apps/website/mod.ts";
