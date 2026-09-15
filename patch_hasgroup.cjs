const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');

code = code.replace(/const checkHasGroupD = availableGroupIds\.includes\('D'\);/, "const hasGroupD = availableGroupIds.includes('D');");
code = code.replace(/const validationWarnings = validateMonthSchedule\(shifts, staffStats, staffList, checkHasGroupD\);/, "const validationWarnings = validateMonthSchedule(shifts, staffStats, staffList, hasGroupD);");

fs.writeFileSync('src/utils/shiftLogic.ts', code);
