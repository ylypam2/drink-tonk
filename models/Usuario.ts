import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUsuario extends mongoose.Document {
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "empleado";
  estado: boolean;
  compararPassword(password: string): Promise<boolean>;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    rol: {
      type: String,
      enum: ["admin", "empleado"],
      default: "empleado",
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UsuarioSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UsuarioSchema.methods.compararPassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

const Usuario = models.Usuario || model<IUsuario>("Usuario", UsuarioSchema);

export default Usuario;