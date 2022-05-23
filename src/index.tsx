/* @refresh reload */
import { render } from "solid-js/web";
import { HopeProvider, NotificationsProvider } from "@hope-ui/solid";

import App from "./App";

render(
  () => (
    <HopeProvider>
      <NotificationsProvider placement="bottom-end">
        <App />
      </NotificationsProvider>
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
