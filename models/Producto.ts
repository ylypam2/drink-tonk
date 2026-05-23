import mongoose, { Schema, model, models } from "mongoose";

const ProductoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    categoria: {
      type: String,
      default: "General",
      trim: true,
    },
    imagen: {
      type: String,
      default: "",
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Producto = models.Producto || model("Producto", ProductoSchema);

export default Producto;