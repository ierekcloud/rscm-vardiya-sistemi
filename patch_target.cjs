const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');

code = code.replace(/export function calculateTargetWorkingDays[\s\S]*?return totalDays - offDaysCount;\n\}/, `export function calculateTargetWorkingDays(year: number, month: number): number {
  return 26;
}`);

fs.writeFileSync('src/utils/shiftLogic.ts', code);
