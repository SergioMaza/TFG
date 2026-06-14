export default function LeftPanel() {
  return (
    <section className="relative hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-between p-12 overflow-hidden">
      {/* IMAGE */}
      <div className="absolute inset-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0j2pj02Hd_ZX-6vagm16aB9KkzdimpqjUwQ0Dey-p1BSfuvaJIB2jHph1RKmiShTGV5OFoDKBKsjp2WLLedeyQ0t-oomU_2VoMfuq352Kz6VQL0QEsG4WmISwoaPJJ1BJxD4-eXPoO4GSzbS84HH1jkHfkUwmdYbKBw2DLVxDzKJ4aLlgkjMl9nRjRisKTlxyLTyJaJTXhm-eisQNEmT96v2vZtYAaZbd1oiIUd9edxWFUTHUchi8LnSsggaHdwGsRjlgyqYs5F0"
          className="w-full h-full object-cover grayscale opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-r from-(--bg)/50 to-(--bg)/10" />
      </div>

      {/* BRAND */}
      <div className="relative z-10 flex items-center gap-3">
        <div>
          <h1 className="font-black text-2xl tracking-tight">KINESIS LAB</h1>
          <p className="text-xs tracking-widest text-(--primary)">
            Análisis preciso de ejercicios con IA
          </p>
        </div>
      </div>

      {/* HERO */}
      <div className="relative z-10 max-w-150 mb-15">
        <h2 className="text-5xl lg:text-7xl font-extrabold leading-[0.9] mb-6">
          Entrena mejor <br />
          con <span className="text-(--primary)">IA</span>
        </h2>

        <p className="text-(--gray) text-lg max-w-90">
          Impulsa tu rendimiento con análisis de movimiento de alta precisión.
        </p>
      </div>
    </section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs uppercase text-(--gray)">{label}</p>
    </div>
  );
}
