import { useForm } from "react-hook-form";
import Input from "./Input";
import { ROUTES } from "../../config/routes";
import { useAppProvider } from "../../hooks/useAppProvider";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { signIn } = useAppProvider();

  const onSubmit = async (data) => {
    const error = await signIn(data.email, data.password);
    console.log("DEBUG error: ", error);
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

      <button className="w-full bg-(--secondary) text-white py-4 rounded-xl font-bold hover:opacity-90 transition cursor-pointer">
        Iniciar Sesión
      </button>
    </form>
  );
}
