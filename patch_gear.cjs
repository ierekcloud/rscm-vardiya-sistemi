const fs = require('fs');
let code = fs.readFileSync('src/utils/shiftLogic.ts', 'utf-8');

const newGear = `
export function getGearStartGroup(
  targetYear: number,
  targetMonth: number,
  anchorYear: number = 2026,
  anchorMonth: number = 8, // 8 = Eylül (0-indexed)
  anchorStartGroup: GroupId = 'A',
  availableGroups: GroupId[] = ['A', 'B', 'C', 'D']
): GroupId {
  const anchorDate = new Date(anchorYear, anchorMonth, 1);
  const targetDate = new Date(targetYear, targetMonth, 1);
  
  // Count exact number of non-Sunday days between anchor and target
  let nonSundayCount = 0;
  
  if (targetDate >= anchorDate) {
    let d = new Date(anchorDate);
    while (d < targetDate) {
      if (d.getDay() !== 0) {
        nonSundayCount++;
      }
      d.setDate(d.getDate() + 1);
    }
  } else {
    let d = new Date(targetDate);
    while (d < anchorDate) {
      if (d.getDay() !== 0) {
        nonSundayCount--;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  const anchorIdx = availableGroups.indexOf(anchorStartGroup);
  const baseIdx = anchorIdx === -1 ? 0 : anchorIdx;
  const targetIdx = ((baseIdx + nonSundayCount) % availableGroups.length + availableGroups.length) % availableGroups.length;

  return availableGroups[targetIdx];
}
`;

code = code.replace(/export function getGearStartGroup[\s\S]*?return availableGroups\[targetIdx\];\n\}/, newGear.trim());
fs.writeFileSync('src/utils/shiftLogic.ts', code);
