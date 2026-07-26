// Kumpulan fungsi validasi sederhana (JS dasar: function + object)

export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email wajib diisi';
  if (!regex.test(email)) return 'Format email tidak valid';
  return '';
}

export function validatePassword(password) {
  if (!password) return 'Password wajib diisi';
  if (password.length < 6) return 'Password minimal 6 karakter';
  return '';
}

export function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') return `${fieldName} wajib diisi`;
  return '';
}

// Validasi form login, return object berisi error per field
export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailError = validateEmail(email);
  const passError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passError) errors.password = passError;
  return errors;
}

// Validasi form register
export function validateRegisterForm({ namaLengkap, email, password, confirmPassword }) {
  const errors = {};
  const namaError = validateRequired(namaLengkap, 'Nama lengkap');
  if (namaError) errors.namaLengkap = namaError;

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  const passError = validatePassword(password);
  if (passError) errors.password = passError;

  if (!confirmPassword) errors.confirmPassword = 'Konfirmasi password wajib diisi';
  else if (password !== confirmPassword) errors.confirmPassword = 'Password tidak sama';

  return errors;
}