import SDK from "@zeitgeistpm/sdk";
import { action, atom, computed } from "nanostores";

export const $sdk = atom<SDK | null>(null);

SDK.initialize().then((sdk) => {
  $sdk.set(sdk);
});
