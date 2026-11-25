import { mascaraCpf, mascaraTel, mascaraData, dataIso, isoParaBr, cpfValido, idade } from '../mascaras'

test('máscaras', () => {
  expect(mascaraCpf('52998224725')).toBe('529.982.247-25')
  expect(mascaraTel('44999990000')).toBe('(44) 99999-0000')
  expect(mascaraData('01011990')).toBe('01/01/1990')
})
test('datas', () => {
  expect(dataIso('31/12/1990')).toBe('1990-12-31')
  expect(dataIso('31/02/1990')).toBeNull()
  expect(isoParaBr('1990-12-31')).toBe('31/12/1990')
  expect(idade('2000-01-01')).toBeGreaterThanOrEqual(26)
})
test('cpf', () => {
  expect(cpfValido('529.982.247-25')).toBe(true)
  expect(cpfValido('111.111.111-11')).toBe(false)
  expect(cpfValido('123.456.789-00')).toBe(false)
})
