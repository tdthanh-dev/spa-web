import { Helmet } from 'react-helmet-async'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import '@assets/styles/main.css'
import '@assets/styles/faq-contact.css'
import { faqData, testimonials, services, reasons, processSteps } from '@constants/homeData'
import { useHomeLogic } from '@hooks/useHomeLogic'
import { useTestimonials } from '@hooks/useTestimonials'
import { useFAQ } from '@hooks/useFAQ'
import HeroSection from '@components/Home/HeroSection'
import PromotionsSection from '@components/Home/PromotionsSection'
import AboutSection from '@components/Home/AboutSection'
import ServicesSection from '@components/Home/ServicesSection'
import WhyChooseSection from '@components/Home/WhyChooseSection'
import ProcessSection from '@components/Home/ProcessSection'
import TestimonialsSection from '@components/Home/TestimonialsSection'
import FAQSection from '@components/Home/FAQSection'
import ContactFormSection from '@components/Home/ContactFormSection'

const Home = () => {
  const {
    formData,
    isSubmitting,
    submitMessage,
    errors,
    isFormValid,
    handleInputChange,
    handleSubmit
  } = useHomeLogic()

  const {
    currentTestimonial,
    goToTestimonial,
    goToNext,
    goToPrevious
  } = useTestimonials(testimonials)

  const {
    activeAccordion,
    toggleAccordion
  } = useFAQ()

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-out-cubic',
      once: true,
      offset: 100
    })
  }, [])

  return (
    <>
      <Helmet>
        <title>Spa Dr Oha - Xăm chân mày, xăm môi đẹp tự nhiên | Đẹp tự nhiên - Chuẩn phong thủy</title>
        <meta name="description" content="Spa Dr Oha chuyên xăm chân mày tự nhiên, xăm môi hồng tươi với công nghệ Hairstroke siêu mảnh. Đội ngũ chuyên gia 10+ năm kinh nghiệm, công nghệ an toàn, bảo hành màu trọn đời." />
        <meta name="keywords" content="xăm chân mày, xăm môi tự nhiên, Spa Dr Oha, xăm chân mày phong thủy, xăm môi collagen, xăm môi lip blushing" />
        <meta property="og:title" content="Spa Dr Oha - Xăm chân mày, xăm môi đẹp tự nhiên" />
        <meta property="og:description" content="Chuyên xăm chân mày tự nhiên, xăm môi hồng tươi với công nghệ hiện đại" />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="home">
        <HeroSection />
        <PromotionsSection />
        <AboutSection />
        <ServicesSection services={services} />
        <WhyChooseSection reasons={reasons} />
        <ProcessSection processSteps={processSteps} />
        <TestimonialsSection
          testimonials={testimonials}
          currentTestimonial={currentTestimonial}
          goToTestimonial={goToTestimonial}
          goToNext={goToNext}
          goToPrevious={goToPrevious}
        />

        {/* Gallery Section */}
        <section className="gallery-section" id="gallery">
          <div className="container">
            <h2 className="section-title">Kết quả trước & sau tại Spa Dr Oha</h2>

            <div className="gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="gallery-item">
                  <img
                    src={`/images/p${num}.jpg`}
                    alt={`Kết quả xăm chân mày tự nhiên Dr Oha ${num}`}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* FAQ and Contact Form Section - Combined Layout */}
        <section className="faq-contact-section" id="faq">
          <div className="container">
            <div className="faq-contact-wrapper">
              <FAQSection
                faqData={faqData}
                activeAccordion={activeAccordion}
                toggleAccordion={toggleAccordion}
              />
              <ContactFormSection
                formData={formData}
                isSubmitting={isSubmitting}
                submitMessage={submitMessage}
                errors={errors}
                isFormValid={isFormValid}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home