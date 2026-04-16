export default function Input({ label, type = "text", placeholder, register }) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase text-(--gray) font-bold">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="w-full bg-(--bg-light) rounded-xl py-4 px-4 focus:ring-2 focus:ring-(--primary)/70 outline-none"
      />
    </div>
  );
}
