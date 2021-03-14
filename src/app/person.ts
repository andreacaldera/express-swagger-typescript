export type Address = {
  city: string
  postCode: string
  countryIsoCode: string
}

export type Person = {
  id: number
  firstName: string
  lastName1: string
  address: Address[]
}
