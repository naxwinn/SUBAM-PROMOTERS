import Divisions from '@/components/sections/Divisions'
import FinalCTA from '@/components/sections/FinalCTA'
import Hero from '@/components/sections/Hero'
import Principles from '@/components/sections/Principles'
import Process from '@/components/sections/Process'
import SelectedWork from '@/components/sections/SelectedWork'
import ServiceOverview from '@/components/sections/ServiceOverview'
import Testimonials from '@/components/sections/Testimonials'
import { images } from '@/lib/assets'
import { useSeo } from '@/lib/seo'

export default function Home() {
  useSeo({
    title: 'Home',
    description:
      'SUBAM PROMOTERS is a real estate marketing and digital growth company. We promote property projects and help businesses grow through strategic campaigns, creative content and conversion-focused digital marketing.',
    path: '/',
    image: images.villaStreet.jpg,
  })

  return (
    <>
      <Hero />
      <Divisions />
      <ServiceOverview />
      <SelectedWork />
      <Principles />
      <Process />
      {/* Renders nothing until verified, consented feedback exists. */}
      <Testimonials />
      <FinalCTA />
    </>
  )
}
