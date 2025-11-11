'use client';

import { motion } from 'framer-motion';
import { Users, Target, Globe, Award } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: "Миссия",
    description: "Переосмысливать моду через инновации, создавая одежду, которая не только выглядит потрясающе, но и функциональна, устойчива и технологически продвинута."
  },
  {
    icon: Globe,
    title: "Устойчивость",
    description: "Мы стремимся к нулевому воздействию на окружающую среду, используя переработанные материалы и внедряя устойчивые практики на каждом этапе производства."
  },
  {
    icon: Users,
    title: "Сообщество",
    description: "Создаем глобальное сообщество новаторов, которые ценят качество, инновации и осознанное потребление."
  },
  {
    icon: Award,
    title: "Качество",
    description: "Каждый предмет одежды проходит строгий контроль качества и создается с вниманием к деталям, чтобы служить вам долгие годы."
  }
];

const team = [
  {
    name: "Анна Иванова",
    role: "Главный дизайнер",
    image: "https://kino-magic.ru/wp-content/uploads/2022/05/WhatsApp-Image-2022-05-23-at-19.53.47.jpeg"
  },
  {
    name: "Максим Петров",
    role: "Технический директор",
    image: "https://uralopera.ru/storage/medium/9pzzWF8LmkSPkW7wEGKkbCs3g50ZAOlHtdp6gZZD.jpeg"
  },
  {
    name: "Елена Смирнова",
    role: "Менеджер по устойчивому развитию",
    image: "https://i.pinimg.com/originals/b4/97/7e/b4977ef0c040d991487740632673bd60.jpg"
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video Background */}
      <section className="relative h-96 flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            aria-hidden="true"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
            Ваш браузер не поддерживает видео.
          </video>
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>

        {/* Hero content */}
        <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            О Нас
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl opacity-90"
          >
            Переосмысливая будущее моды
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Наша История
              </h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  ELEVATE родился из желания изменить индустрию моды. Мы верим, что одежда должна быть не только красивой, 
                  но и умной, устойчивой и функциональной.
                </p>
                <p>
                  Основанная в 2024 году, наша компания объединила лучших дизайнеров, инженеров и экологов для создания 
                  одежды будущего. Мы используем передовые технологии, такие как умные ткани, биометрические датчики 
                  и устойчивые материалы.
                </p>
                <p>
                  Сегодня ELEVATE — это больше чем бренд одежды. Это сообщество новаторов, стремящихся сделать мир 
                  лучше через осознанную моду.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Наше производство"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Наши Ценности
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Принципы, которые направляют каждое наше решение и вдохновляют на инновации
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl shadow-lg text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Наша Команда
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Талантливые профессионалы, объединенные страстью к инновациям и устойчивой моде
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <div className="relative mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <p className="text-purple-600 font-medium">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}