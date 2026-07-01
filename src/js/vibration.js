export function vibrate(pattern=[180]){if('vibrate'in navigator) navigator.vibrate(pattern)}
export function cameraPattern(level){return level==='final'?[250,120,250,120,350]:level==='second'?[180,100,180]:[120]}
