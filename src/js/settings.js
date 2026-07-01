const KEY='speed-guard-settings';
export const defaults={alertMode:'voice-vibration',voice:true,vibration:true,volume:0.9,firstDistance:1000,secondDistance:500,finalDistance:250,overspeedTolerance:4,maxCameraRadius:1800,frontAngle:55,directionTolerance:80,shareReports:false,reportEndpoint:'/api/report',batterySaver:true,wakeDistance:2000};
export function loadSettings(){return {...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')}}
export function saveSettings(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
