import { getState, setScreen } from "./ui/state";

import { renderApp } from "./ui/render";

function init() {
  const state = getState();

  if (state.user && state.credits > 0) {
    setScreen("dashboard");
  } else if (state.user && state.credits <= 0) {
    setScreen("paywall");
  } else {
    setScreen("welcome");
  }

  renderApp();
}

init();