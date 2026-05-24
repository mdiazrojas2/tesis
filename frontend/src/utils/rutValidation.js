export const validateRUT = (rut) => {
  if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false;
  
  let tmp = rut.split('-');
  let digv = tmp[1].toLowerCase();
  let rutNum = tmp[0];
  
  if (digv === 'k') digv = 10;
  else if (digv === '0') digv = 11;
  else digv = parseInt(digv, 10);
  
  let M = 0;
  let S = 1;
  let T = parseInt(rutNum, 10);
  
  for (; T; T = Math.floor(T / 10)) {
    S = (S + T % 10 * (9 - M++ % 6)) % 11;
  }
  
  return S ? S - 1 === digv : 11 === digv || S === digv;
};

export const formatRUT = (rut) => {
  let value = rut.replace(/[^0-9kK]+/g, '').toUpperCase();
  if (value.length <= 1) return value;
  let result = value.slice(-1);
  value = value.slice(0, -1);
  return `${value}-${result}`;
};

export const validateName = (name) => {
  if (!name) return false;
  return /^[A-Za-zÁ-Úá-úñÑ\s]+$/.test(name);
};
