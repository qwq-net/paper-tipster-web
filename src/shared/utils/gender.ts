export function getGenderBadgeClass(gender: string): string {
  switch (gender) {
    case '牡':
      return 'bg-blue-100 text-blue-800';
    case '牝':
      return 'bg-pink-100 text-pink-800';
    case 'セン':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getDisplayGender(gender: string): string {
  return gender === 'セン' ? 'セ' : gender;
}

export function getGenderAge(gender: string, age: number | null): string {
  const displayGender = getDisplayGender(gender);
  return age !== null ? `${displayGender}${age}` : displayGender;
}
