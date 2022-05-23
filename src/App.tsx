import { useStore } from "@nanostores/solid";
import type { Component } from "solid-js";
import { $sdk } from "./state/sdk";

const App: Component = () => {
  const sdk = useStore($sdk);
  return <div></div>;
};

export default App;
