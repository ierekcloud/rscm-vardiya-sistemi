const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');

// Replace Set for unique warnings
code = code.replace(/return Array\.from\(new Set\(warnings\)\);/g, 'return warnings.filter((item, pos) => warnings.indexOf(item) === pos);');

// Replace Set for uniqueDays
code = code.replace(/const uniqueDays = new Set\(days\);\n\s*if \(uniqueDays\.size !== days\.length\) \{/g, `
    const uniqueDays = days.filter((item, pos) => days.indexOf(item) === pos);
    if (uniqueDays.length !== days.length) {
`);

fs.writeFileSync('src/utils/shiftLogic.ts', code);
