import { useForm } from "react-hook-form";
import Input from "./Input";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    console.log(data);
    navigate(ROUTES.dashboard);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Correo"
        type="email"
        placeholder="correo@gmail.com"
        register={register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        register={register("password")}
      />

      <button className="w-full bg-(--secondary) text-white py-4 rounded-xl font-bold hover:opacity-90 transition">
        Iniciar Sesión
      </button>
    </form>
  );
}
