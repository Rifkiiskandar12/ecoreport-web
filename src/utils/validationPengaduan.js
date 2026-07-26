import { validateRequired } from './validation';

export function validatePengaduanForm({ judul, deskripsi, lokasi, kategoriId }) {
  const errors = {};

  const judulError = validateRequired(judul, 'Judul');
  if (judulError) errors.judul = judulError;
  else if (judul.length < 10) errors.judul = 'Judul minimal 10 karakter';

  const deskripsiError = validateRequired(deskripsi, 'Deskripsi');
  if (deskripsiError) errors.deskripsi = deskripsiError;
  else if (deskripsi.length < 20) errors.deskripsi = 'Deskripsi minimal 20 karakter';

  const lokasiError = validateRequired(lokasi, 'Lokasi');
  if (lokasiError) errors.lokasi = lokasiError;

  if (!kategoriId) errors.kategoriId = 'Kategori wajib dipilih';

  return errors;
}