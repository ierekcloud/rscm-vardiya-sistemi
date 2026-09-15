const fs = require('fs');

let cv = fs.readFileSync('src/components/CalendarView.tsx', 'utf-8');
cv = cv.replace(/const uniqueGroupIds = Array\.from\(new Set\(shift\.dutyStaff\.map\(s => s\.groupId\)\)\) as GroupId\[\];/, 
  'const uniqueGroupIds = shift.dutyStaff.map(s => s.groupId).filter((value, index, self) => self.indexOf(value) === index) as GroupId[];');
fs.writeFileSync('src/components/CalendarView.tsx', cv);

let sl = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');
sl = sl.replace(/const availableGroupIds = Array\.from\(new Set\(staffList\.map\(\(s\) => s\.groupId\)\)\);/,
  'const availableGroupIds = staffList.map(s => s.groupId).filter((value, index, self) => self.indexOf(value) === index);');
fs.writeFileSync('src/utils/shiftLogic.ts', sl);

