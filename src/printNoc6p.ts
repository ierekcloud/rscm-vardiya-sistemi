import { DEFAULT_DEPARTMENTS, getRotatedStaff } from './utils/shiftLogic';

const noc6p = DEFAULT_DEPARTMENTS.find(d => d.id === 'dep-noc-6p')!;
for (let m = 9; m <= 16; m++) {
  const y = 2026 + Math.floor(m / 12);
  const mo = m % 12;
  const s = getRotatedStaff(noc6p.staff, y, mo, 'MEETING_6P');
  console.log(`${y}-${mo+1}: A=[${s[0].name}, ${s[1].name}], B=[${s[2].name}, ${s[3].name}], C=[${s[4].name}, ${s[5].name}]`);
}
