import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * Landing page for the UranButeel platform.
 *
 * This page uses a modern SaaS aesthetic with a hero section,
 * a three‑step "How it works" guide, and a trust section that
 * highlights the escrow payment protection and QPay integration.
 * Tailwind CSS provides the styling, while Framer Motion adds
 * subtle animations to enhance the user experience.
 */
export default function Home() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold mb-4 max-w-3xl"
        >
          Монголын шилдэг уран бүтээлчдийг эндээс ол
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg md:text-2xl mb-8 max-w-2xl"
        >
          UranButeel бол захиалагчид болон уран бүтээлчдийг холбох Монголын шинэ үеийн marketplace. Энд та
          бүтээлч авьяаслаг хүмүүсийг амархан олох, гэрээ байгуулах, төслийн төлбөрөө хамгаалагдсан байдлаар
          гүйцэтгэх боломжтой.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex space-x-4"
        >
          <Link href="/signup" className="inline-block px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg shadow hover:bg-gray-100 transition">
            Бүртгүүлэх
          </Link>
          <Link href="/browse-jobs" className="inline-block px-6 py-3 bg-transparent border border-white font-medium rounded-lg hover:bg-white hover:text-indigo-700 transition">
            Ажил хайх
          </Link>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Хэрхэн ажилладаг вэ?
        </motion.h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1: Post a Job */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white shadow-sm hover:shadow-lg transition rounded-xl p-6 text-center"
          >
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-indigo-100 text-indigo-600 rounded-full">
              {/* Icon: Briefcase / Posting */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 9.75V6.375A2.625 2.625 0 0013.875 3.75h-3.75A2.625 2.625 0 007.5 6.375V9.75M3.75 9.75h16.5m-14.25 3.75h12m-12 3h12M3.75 9.75v9.375A2.625 2.625 0 006.375 21.75h11.25a2.625 2.625 0 002.625-2.625V9.75" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ажил тавих</h3>
            <p className="text-gray-600">Төслийнхөө шаардлага, төсөв, хугацааг тодорхойлон зар дууруулж, мэргэжлийн уран бүтээлчдээс санал хүлээн ав.</p>
          </motion.div>
          {/* Step 2: Make a Contract */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white shadow-sm hover:shadow-lg transition rounded-xl p-6 text-center"
          >
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-indigo-100 text-indigo-600 rounded-full">
              {/* Icon: Document / Contract */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.125V6.375A2.625 2.625 0 0013.875 3.75H7.5a2.625 2.625 0 00-2.625 2.625v12.75A2.625 2.625 0 007.5 21.75h9a2.625 2.625 0 002.625-2.625V15M16.5 10.125H21m0 0l-4.5 4.5m4.5-4.5l-4.5-4.5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Гэрээ байгуулах</h3>
            <p className="text-gray-600">Саналуудаас хамгийн тохиромжтой уран бүтээлчийг сонгон, уян хатан гэрээ байгуулж, milestone-уудаа тохируулаарай.</p>
          </motion.div>
          {/* Step 3: Secure Payment */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white shadow-sm hover:shadow-lg transition rounded-xl p-6 text-center"
          >
            <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 bg-indigo-100 text-indigo-600 rounded-full">
              {/* Icon: Payment / Shield */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-3-3m3 3l3-3" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 9.75v2.25a6.75 6.75 0 01-6.75 6.75h-4.5A6.75 6.75 0 013 12V9.75A6.75 6.75 0 019.75 3h4.5A6.75 6.75 0 0121 9.75z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Төлбөр баталгаажуулах</h3>
            <p className="text-gray-600">Milestone бүрийг урьдчилан санхүүжүүлж, төслийг дуусмагц төлбөр автоматаар уран бүтээлчид шилжих тул хоёр талд адилхан итгэлтэй.</p>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 bg-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Итгэлцэл ба Аюулгүй байдал
        </motion.h2>
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold mb-2">Escrow хамгаалалт</h3>
            <p className="text-gray-700">
              Төлбөрийг төсөл дуусах хүртэл итгэлцлийн сандаа хадгалдаг тул хоёр талын эрх ашиг хамгаалагдана. Захиалагч мөнгөө&nbsp;
              төсөл гүйцэтгэхээс өмнө байршуулж, уран бүтээлч ажлаа хийн дуусмагц та зөвшөөрсөний дараа л шилждэг—эсвэл
              14 хоногийн дотор ямар ч хариу өгөхгүй бол автоматаар шилждэг【249599601513389†L210-L216】.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-2">QPay интеграци</h3>
            <p className="text-gray-700">
              UranButeel нь QPay‑ийн динамик QR код, DeepLink төлбөр болон UnionPay, WeChat Pay зэрэг олон улсын төлбөр
              хүлээн авах боломжуудыг бүрэн дэмжсэн. QPay нь Монголын анхны QR код төлбөрийн систем бөгөөд
              худалдаа эрхлэгчдэд зориулсан онцлог давуу талуудтай【835738881985601†L21-L24】.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
