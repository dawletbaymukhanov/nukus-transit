import { NavLink } from "react-router-dom";

const items = [
  { to: "/", label: "Qidirish", icon: "🧭", end: true },
  { to: "/yonalishlar", label: "Yo'nalishlar", icon: "🚌" },
  { to: "/bekatlar", label: "Bekatlar", icon: "📍" },
  { to: "/haqida", label: "Haqida", icon: "ℹ️" },
];

export default function BottomNav() {
  return (
    <nav className="safe-bottom border-t border-slate-200 bg-white">
      <ul className="grid grid-cols-4">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs ${
                  isActive ? "font-semibold text-teal-700" : "text-slate-500"
                }`
              }
            >
              <span className="text-xl leading-none">{it.icon}</span>
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
