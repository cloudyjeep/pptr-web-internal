import { DataTypes, defineModel } from "@/api/model/db";

// Define the User model
export const User = defineModel("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
});

export const Customer = defineModel("Customer", {
  code_customer: {
    primaryKey: true,
    type: DataTypes.STRING,
    allowNull: true,
  },
  branch_code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bussiness_unit: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  id_pelanggan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ktp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  no_telp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  branch_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kecamatan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  kelurahan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  branch_addres: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rt: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rw: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  blok: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nomor_rumah: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  perumahan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nama_jalan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rute_baca_meter: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dma: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  golongan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meter_size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  meter_serial_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status_customer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status_meter: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  tanggal_pasang_wm: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
