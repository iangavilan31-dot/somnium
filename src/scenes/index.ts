// Scene registry — chapters 2+ register themselves here as they are built.
// Journey order is SCENES sorted by id (scene 1 lives in journey.ts, wrapping
// the proven Red-Sun Field baker).

import { registerScene } from "../journey";
import { SCENE2 } from "./scene2";
import { SCENE3 } from "./scene3";
import { SCENE4 } from "./scene4";

registerScene(SCENE2);
registerScene(SCENE3);
registerScene(SCENE4);
