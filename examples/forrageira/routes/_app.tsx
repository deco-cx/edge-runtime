/** @jsxImportSource preact */

import { AppProps } from "$fresh/server.ts";
import GlobalTags from "deco-sites/forrageira/components/GlobalTags.tsx";
function App(props: AppProps) {
  return (
    <>
      {/* Include fonts, icons and more */}
      <GlobalTags />

      {/* Rest of Preact tree */}
      <props.Component />
    </>
  );
}

export default App;
