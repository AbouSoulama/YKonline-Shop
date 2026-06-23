import { Droplets, Sun, Sparkles, Hand, Snowflake, Users } from "lucide-react";
import { Link } from "react-router-dom";

const routines = [
  {
    icon: Droplets,
    title: "Dry skin routine",
    color: "from-orange-light to-cream",
    iconColor: "text-orange",
    steps: [
      "Apply after shower on still damp skin",
      "Focus on dry areas: elbows, knees, legs, feet, hands",
      "Use a small amount, warm well between hands",
      "Massage gently until fully absorbed",
    ],
    tip: "For very dry areas, apply a generous layer in the evening and let it work overnight.",
  },
  {
    icon: Sparkles,
    title: "Dry hair routine",
    color: "from-green-light to-cream",
    iconColor: "text-green",
    steps: [
      "On dry hair: apply a small amount to lengths and ends",
      "As an oil treatment: apply generously 30 min before shampoo",
      "For curly, frizzy or coily hair: use daily to define curls",
      "Avoid the roots to prevent greasiness",
    ],
    tip: "For an intensive treatment, leave on overnight and shampoo the next morning.",
  },
  {
    icon: Hand,
    title: "Hands & feet routine",
    color: "from-cream to-orange-light",
    iconColor: "text-brown",
    steps: [
      "Apply a generous layer in the evening",
      "For hands: massage nails and cuticles",
      "For feet: focus on heels and rough areas",
      "Wear cotton gloves or socks for better absorption",
    ],
    tip: "Do this 2-3 times a week for soft, nourished hands and feet.",
  },
  {
    icon: Snowflake,
    title: "Winter routine",
    color: "from-cream to-green-light",
    iconColor: "text-green",
    steps: [
      "Protect areas exposed to cold and dryness",
      "Apply to face, hands and lips before going out",
      "Use a richer layer at night to repair",
      "Don't forget the body after each shower",
    ],
    tip: "Keep a small jar handy to reapply during the day.",
  },
  {
    icon: Users,
    title: "Family routine",
    color: "from-orange-light to-green-light",
    iconColor: "text-orange",
    steps: [
      "Adults: raw butter for rich, nourishing care",
      "Children: whipped butter for light, easy application",
      "Babies: a tiny amount on clean, dry skin",
      "Everyone: targeted application on dry areas",
    ],
    tip: "Always test on a small area of skin first. Avoid contact with eyes.",
  },
  {
    icon: Sun,
    title: "Summer routine",
    color: "from-cream to-orange-light",
    iconColor: "text-orange",
    steps: [
      "After-sun care: apply to soothe and nourish",
      "On damp skin after showering for better hydration",
      "Light application on hair exposed to sun and salt",
      "Use whipped texture for a lighter, non-greasy finish",
    ],
    tip: "Shea butter is not a sunscreen. Use appropriate sun protection.",
  },
];

export default function Routines() {
  return (
    <div className="fade-in">
      <section className="bg-gradient-to-br from-cream to-orange-light py-16">
        <div className="container-page text-center max-w-3xl">
          <p className="text-orange font-bold uppercase tracking-wider text-sm">Beauty routines</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-5">Simple routines for natural beauty</h1>
          <p className="text-lg text-gray-600">Discover how to integrate organic shea butter into your daily routine, according to your needs and desires.</p>
        </div>
      </section>

      <section className="container-page py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map((r) => (
          <div key={r.title} className="bg-white rounded-3xl overflow-hidden card-shadow card-shadow-hover border border-cream">
            <div className={`bg-gradient-to-br ${r.color} p-8`}>
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <r.icon className={r.iconColor} size={28} />
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-semibold text-xl text-gray-900 mb-4">{r.title}</h3>
              <ol className="space-y-2 mb-4">
                {r.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-green-light text-green text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="bg-orange-light/60 rounded-2xl p-3 text-sm text-orange-dark italic">Expert tip: {r.tip}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="container-page pb-16">
        <div className="rounded-[2.5rem] bg-green text-white p-10 md:p-14 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Find the perfect shea butter for your routine</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">Explore our selection of premium organic shea butters and choose the one that suits your routine best.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-8 py-4 rounded-full transition-colors">Browse products</Link>
        </div>
      </section>
    </div>
  );
}
