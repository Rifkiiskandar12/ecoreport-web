// JavaScript OOP: Class model untuk entitas Pengaduan

export class Pengaduan {
  constructor({ id, userId, kategoriId, judul, deskripsi, lokasi, fotoUrl, status, createdAt, isAnonim, kategori, latitude, longitude }) {
    this.id = id;
    this.userId = userId;
    this.kategoriId = kategoriId;
    this.judul = judul;
    this.deskripsi = deskripsi;
    this.lokasi = lokasi;
    this.fotoUrl = fotoUrl;
    this.status = status || 'menunggu';
    this.createdAt = createdAt;
    this.isAnonim = isAnonim || false;
    this.kategori = kategori;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  // Method: nama pelapor yang ditampilkan (disamarkan jika anonim)
  getNamaPelapor(namaAsli) {
    return this.isAnonim ? 'Pelapor Anonim' : namaAsli || '-';
  }

  // Method: label status yang ramah dibaca
  getStatusLabel() {
    const labels = {
      menunggu: 'Menunggu Verifikasi',
      diproses: 'Sedang Diproses',
      selesai: 'Selesai',
      ditolak: 'Ditolak',
    };
    return labels[this.status] || this.status;
  }

  // Method: warna badge sesuai status
  getStatusColor() {
    const colors = {
      menunggu: 'bg-warning/10 text-warning',
      diproses: 'bg-secondary/10 text-secondary',
      selesai: 'bg-success/10 text-success',
      ditolak: 'bg-danger/10 text-danger',
    };
    return colors[this.status] || 'bg-gray-100 text-gray-700';
  }

  // Static method: konversi row database (snake_case) jadi instance class ini
  static fromDb(row) {
    return new Pengaduan({
      id: row.id,
      userId: row.user_id,
      kategoriId: row.kategori_id,
      judul: row.judul,
      deskripsi: row.deskripsi,
      lokasi: row.lokasi,
      fotoUrl: row.foto_url,
      status: row.status,
      createdAt: row.created_at,
      isAnonim: row.is_anonim,
      kategori: row.kategori, // ikut terbawa jika query pakai join select('*, kategori(nama)')
      latitude: row.latitude,
      longitude: row.longitude,
    });
  }

  // Konversi ke payload untuk insert/update ke Supabase
  toDbPayload() {
    return {
      user_id: this.userId,
      kategori_id: this.kategoriId,
      judul: this.judul,
      deskripsi: this.deskripsi,
      lokasi: this.lokasi,
      foto_url: this.fotoUrl,
      is_anonim: this.isAnonim,
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }
}