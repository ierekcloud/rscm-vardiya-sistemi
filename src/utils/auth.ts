export interface ManagerCredentials {
  registryNumber: string; // Sicil: '12345'
  password: string;
  departmentId: string;
  departmentName: string;
}

export const DEPARTMENT_MANAGERS: ManagerCredentials[] = [
  {
    registryNumber: '12345',
    password: 'dilek',
    departmentId: 'dep-noc',
    departmentName: 'NOC',
  },
  {
    registryNumber: '12345',
    password: 'hüseyin',
    departmentId: 'dep-mpls',
    departmentName: 'MPLS',
  },
  {
    registryNumber: '12345',
    password: 'mehmet',
    departmentId: 'dep-dsl',
    departmentName: 'DSL',
  },
  {
    registryNumber: '12345',
    password: 'mustafa',
    departmentId: 'dep-santral',
    departmentName: 'SANTRAL',
  },
  {
    registryNumber: '12345',
    password: 'menderes',
    departmentId: 'dep-transmisyon',
    departmentName: 'TRANSMİSYON',
  },
];

export function verifyManagerLogin(
  registryNumber: string,
  password: string
): ManagerCredentials | null {
  const cleanReg = registryNumber.trim();
  const cleanPass = password.trim().toLowerCase();

  const found = DEPARTMENT_MANAGERS.find(
    (m) =>
      m.registryNumber === cleanReg &&
      m.password.toLowerCase() === cleanPass
  );

  return found || null;
}
