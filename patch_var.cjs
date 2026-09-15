const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');
code = code.replace(/const checkHasGroupD = staffList\.some\(s => s\.groupId === 'D'\);\n\s*const validationWarnings = validateMonthSchedule\(shifts, staffStats, staffList, checkHasGroupD\);/, 'const validationWarnings = validateMonthSchedule(shifts, staffStats, staffList, checkHasGroupD);');
fs.writeFileSync('src/utils/shiftLogic.ts', code);
