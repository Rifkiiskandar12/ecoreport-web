import { supabase } from '../lib/supabase';
import { Pengaduan } from '../models/Pengaduan';

// Service = lapisan yang bicara ke database, dipanggil dari komponen (Controller)

export const pengaduanService = {
  async create(pengaduanData) {
    const { data, error } = await supabase
      .from('pengaduan')
      .insert(pengaduanData.toDbPayload())
      .select()
      .single();
    if (error) throw new Error(error.message);
    return Pengaduan.fromDb(data);
  },

  async getByUser(userId) {
    const { data, error } = await supabase
      .from('pengaduan')
      .select('*, kategori(nama)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data.map(Pengaduan.fromDb);
  },

  async getAll() {
    const { data, error } = await supabase
      .from('pengaduan')
      .select('*, kategori(nama), profiles(nama_lengkap)')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('pengaduan')
      .select('*, kategori(nama), profiles(nama_lengkap)')
      .eq('id', id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async updateStatus(id, status, catatan = '') {
    const { data, error } = await supabase
      .from('pengaduan')
      .update({ status, catatan_petugas: catatan })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return Pengaduan.fromDb(data);
  },

  async update(id, payload) {
    const { error } = await supabase.from('pengaduan').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async delete(id) {
    const { error } = await supabase.from('pengaduan').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async uploadFoto(file, userId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('pengaduan-foto').upload(fileName, file);
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('pengaduan-foto').getPublicUrl(fileName);
    return data.publicUrl;
  },
};

export const kategoriService = {
  async getAll() {
    const { data, error } = await supabase.from('kategori').select('*').order('nama');
    if (error) throw new Error(error.message);
    return data;
  },

  async create(nama, deskripsi) {
    const { error } = await supabase.from('kategori').insert({ nama, deskripsi });
    if (error) throw new Error(error.message);
  },

  async update(id, nama, deskripsi) {
    const { error } = await supabase.from('kategori').update({ nama, deskripsi }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async delete(id) {
    const { error } = await supabase.from('kategori').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

export const userService = {
  async getAll() {
    const { data, error } = await supabase.from('profiles').select('*').order('nama_lengkap');
    if (error) throw new Error(error.message);
    return data;
  },

  async updateRole(id, role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) throw new Error(error.message);
  },
};