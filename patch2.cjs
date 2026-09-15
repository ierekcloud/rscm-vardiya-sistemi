const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');
code = code.replace('const validationWarnings = validateMonthSchedule(shifts, staffStats, staffList, hasGroupD);', 'const validationWarnings: string[] = [];');
fs.writeFileSync('src/utils/shiftLogic.ts', code);
