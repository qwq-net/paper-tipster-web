export function getGenderBadgeClass(gender: string): string {
  switch (gender) {
    case '牡':
    case 'HORSE':
    case 'COLT':
      return 'bg-blue-100 text-blue-800';
    case '牝':
    case 'MARE':
    case 'FILLY':
      return 'bg-pink-100 text-pink-800';
    case 'セン':
    case 'GELDING':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getDisplayGender(gender: string): string {
  switch (gender) {
    case 'HORSE':
    case 'COLT':
    case '牡':
      return '牡';
    case 'MARE':
    case 'FILLY':
    case '牝':
      return '牝';
    case 'GELDING':
    case 'セン':
      return 'セ';
    default:
      return gender;
  }
}

export function getGenderAge(gender: string, age: number | null): string {
  const displayGender = getDisplayGender(gender);
  return age !== null ? `${displayGender}${age}` : displayGender;
}
