type NameConfigFunction = (
  data: string
) => Record<string, { firstname?: string; surname?: string; middlename?: string}>

export const NAME_MAPPINGS: Record<string, NameConfigFunction> = {
  'birth.child.firstNamesEng': (data: string) => ({
    'child.name': { firstname: data },
  }),
  'birth.child.familyNameEng': (data: string) => ({
    'child.name': { surname: data },
  }),
  'birth.child.middleNameEng': (data: string) => ({
    'child.name': { middlename: data },
  }),
  'birth.informant.firstNamesEng': (data: string) => ({
    'informant.name': { firstname: data },
  }),
  'birth.informant.familyNameEng': (data: string) => ({
    'informant.name': { surname: data },
  }),
  'birth.informant.middleNameEng': (data: string) => ({
    'informant.name': { middlename: data },
  }),
  'birth.mother.firstNamesEng': (data: string) => ({
    'mother.name': { firstname: data },
  }),
  'birth.mother.familyNameEng': (data: string) => ({
    'mother.name': { surname: data },
  }),
  'birth.mother.middleNameEng': (data: string) => ({
    'mother.name': { middlename: data },
  }),
  'birth.father.firstNamesEng': (data: string) => ({
    'father.name': { firstname: data },
  }),
  'birth.father.familyNameEng': (data: string) => ({
    'father.name': { surname: data },
  }),
  'birth.father.middleNameEng': (data: string) => ({
    'father.name': { middlename: data },
  }),
  'death.deceased.firstNamesEng': (data: string) => ({
    'deceased.name': { firstname: data },
  }),
  'death.deceased.familyNameEng': (data: string) => ({
    'deceased.name': { surname: data },
  }),
  'death.deceased.middleNameEng': (data: string) => ({
    'deceased.name': { middlename: data },
  }),
  'death.informant.firstNamesEng': (data: string) => ({
    'informant.name': { firstname: data },
  }),
  'death.informant.familyNameEng': (data: string) => ({
    'informant.name': { surname: data },
  }),
  'death.informant.middleNameEng': (data: string) => ({
    'informant.name': { middlename: data },
  }),
  'death.spouse.firstNamesEng': (data: string) => ({
    'spouse.name': { firstname: data },
  }),
  'death.spouse.familyNameEng': (data: string) => ({
    'spouse.name': { surname: data },
  }),
  'death.spouse.middleNameEng': (data: string) => ({
    'spouse.name': { middlename: data },
  }), 
  'death.mother.firstNamesEng': (data: string) => ({
    'mother.name': { firstname: data },
  }),
  'death.mother.middleNameEng': (data: string) => ({
    'mother.name': { middlename: data },
  }),
  'death.mother.familyNameEng': (data: string) => ({
    'mother.name': { surname: data },
  }),
  'death.father.firstNamesEng': (data: string) => ({
    'father.name': { firstname: data },
  }),
  'death.father.middleNameEng': (data: string) => ({
    'father.name': { middlename: data },
  }),
  'death.father.familyNameEng': (data: string) => ({
    'father.name': { surname: data },
  }),
}
