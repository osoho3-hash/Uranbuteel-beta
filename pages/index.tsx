import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
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
          UranButeel платформ дээр төслөө нийтэлж, мэргэжлийн фрилансерүүдтэй аюулгүй холбогдоорой.
        </motion.p>
        <div className="flex gap-4">
          <Link href="/signup" className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition">
            Эхлэх
          </Link>
          <Link href="/browse-jobs" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-indigo-600 transition">
            Ажил хайх
          </Link>
        </div>
      </section>

      <section className="py-20 px-4 max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="text-xl font-semibold mb-2">Escrow хамгаалалт</h3>
          <p className="text-gray-600">Төлбөрийг төсөл дуусах хүртэл итгэлцлийн сандаа хадгалж, хоёр талын эрх ашгийг хамгаална.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">QPay Интеграци</h3>
          <p className="text-gray-600">Монголын бүх банкны аппликейшнаар хялбар бөгөөд хурдан төлбөрөө гүйцэтгэх боломжтой.</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Баталгаат чанар</h3>
          <p className="text-gray-600">Зөвхөн шалгарсан, туршлагатай уран бүтээлчидтэй хамтран ажиллах нөхцөлийг бүрдүүлнэ.</p>
        </div>
      </section>
    </div>
  );
}
