import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import './Services.css'

const Services = () => {
  const services = [
    {
      id: 1,
      name: "Xăm Môi Tự Nhiên",
      icon: "💋",
      price: "2.500.000đ - 3.500.000đ",
      duration: "2-3 giờ",
      description: "Phun môi collagen tự nhiên, tạo độ ẩm và màu sắc hoàn hảo cho đôi môi",
      features: [
        "Tạo màu môi tự nhiên, phù hợp với tông da",
        "Công nghệ phun môi collagen hiện đại",
        "Giữ màu 2-3 năm",
        "Không đau, không sưng",
        "Bảo hành 1 năm, chăm sóc miễn phí"
      ],
      process: [
        "Tư vấn và thiết kế màu môi phù hợp",
        "Vệ sinh và tê môi",
        "Phun môi theo kỹ thuật chuyên nghiệp",
        "Chăm sóc và hướng dẫn sau xăm"
      ]
    },
    {
      id: 2,
      name: "Xăm Chân Mày 6D",
      icon: "👁️",
      price: "3.000.000đ - 4.000.000đ",
      duration: "2.5-3.5 giờ",
      description: "Công nghệ 6D hiện đại, tạo từng sợi lông mày sắc nét như thật",
      features: [
        "Kỹ thuật xăm 6D tạo hiệu ứng 3D sống động",
        "Thiết kế chân mày theo tỷ lệ khuôn mặt",
        "Màu sắc tự nhiên, không xanh, không đỏ",
        "Giữ màu 3-5 năm",
        "Bảo hành 2 năm, touch-up miễn phí"
      ],
      process: [
        "Thiết kế dáng chân mày theo khuôn mặt",
        "Chọn màu phù hợp với màu da và tóc",
        "Xăm từng sợi lông mày theo kỹ thuật 6D",
        "Chăm sóc và bảo dưỡng sau xăm"
      ]
    },
    {
      id: 3,
      name: "Phun Môi Ombre",
      icon: "🌸",
      price: "2.800.000đ - 3.800.000đ",
      duration: "2-3 giờ",
      description: "Kỹ thuật gradient tạo hiệu ứng ombre tự nhiên, sang trọng",
      features: [
        "Hiệu ứng ombre từ nhạt đến đậm tự nhiên",
        "Tạo độ bóng và chiều sâu cho môi",
        "Phù hợp với mọi độ tuổi",
        "Màu sắc theo xu hướng hiện đại",
        "Bảo hành 1 năm, chạm màu miễn phí"
      ],
      process: [
        "Tư vấn và chọn tone màu ombre",
        "Thiết kế độ đậm nhạt phù hợp",
        "Phun môi theo kỹ thuật gradient",
        "Hoàn thiện và chăm sóc sau phun"
      ]
    },
    {
      id: 4,
      name: "Xăm Viền Mắt",
      icon: "👀",
      price: "1.800.000đ - 2.500.000đ",
      duration: "1.5-2 giờ",
      description: "Tạo đường viền mắt tự nhiên, giúp mắt to tròn hơn",
      features: [
        "Đường viền mắt tự nhiên, không cứng",
        "Tạo hiệu ứng mắt to, sâu hơn",
        "Tiết kiệm thời gian trang điểm",
        "Màu sắc bền màu 2-3 năm",
        "An toàn cho vùng da nhạy cảm"
      ],
      process: [
        "Thiết kế đường viền phù hợp với mắt",
        "Vệ sinh và tê vùng mắt",
        "Xăm viền theo kỹ thuật chuyên nghiệp",
        "Chăm sóc đặc biệt sau xăm"
      ]
    }
  ]

  return (
    <>
      <Helmet>
        <title>🏆 Bảng Giá Xăm Môi Chân Mày TPHCM 2024 | Beauty Spa - Kỹ Thuật 6D Hàn Quốc</title>
        <meta
          name="description"
          content="🏷️ Bảng giá xăm môi chân mày TPHCM 2024: Xăm môi 6D từ 2.5tr, Chân mày 6D từ 3tr, Ombre từ 2.8tr ✓ Kỹ thuật Hàn Quốc ✓ Bảo hành 2 năm ✓ 1000+ review 5 sao ✓ Tư vấn miễn phí: 0123-456-789"
        />
        <meta name="keywords" content="bảng giá xăm môi TPHCM, giá xăm chân mày 6D, xăm môi giá bao nhiêu, phun môi ombre giá, spa xăm môi quận 1, xăm chân mày 6D Hàn Quốc, xăm môi collagen, giá xăm thẩm mỹ 2024" />
        <meta name="geo.region" content="VN-SG" />
        <meta name="geo.placename" content="Ho Chi Minh City" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BeautySalon",
            "name": "Beauty Spa - Xăm Môi Chân Mày TPHCM",
            "description": "Spa chuyên xăm môi, xăm chân mày 6D kỹ thuật Hàn Quốc",
            "url": "https://beautyspa.vn",
            "telephone": "+84123456789",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Đường ABC",
              "addressLocality": "Quận 1",
              "addressRegion": "TP.HCM",
              "addressCountry": "VN"
            },
            "priceRange": "1,800,000 - 4,000,000 VND",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "1000"
            }
          })}
        </script>
      </Helmet>

      <div className="services">
        {/* Hero Section */}
        <section className="services-hero">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/videos/video_hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="container">
            <div className="services-hero-content text-on-dark">
              <h1>🏷️ Bảng Giá Xăm Môi Chân Mày TPHCM 2024</h1>
              <p className="services-hero-subtitle">
                ⭐ Kỹ thuật 6D Hàn Quốc ⭐ Bảo hành 2 năm ⭐ 1000+ khách tin tưởng ⭐ Giá từ 1.8 triệu
              </p>
              <div className="price-highlights">
                <span className="price-highlight">💋 Xăm môi: Từ 2.5tr</span>
                <span className="price-highlight">👁️ Chân mày: Từ 3tr</span>
                <span className="price-highlight">🌸 Ombre: Từ 2.8tr</span>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="services-main">
          <div className="container">
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.id} className="service-detail-card">
                  <div className="service-header">
                    <div className="service-icon">{service.icon}</div>
                    <div className="service-info">
                      <h2>{service.name}</h2>
                      <p className="service-description">{service.description}</p>
                      <div className="service-meta">
                        <span className="service-price">💰 {service.price}</span>
                        <span className="service-duration">⏱️ {service.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="service-content">
                    <div className="service-features">
                      <h3>✨ Đặc điểm nổi bật</h3>
                      <ul>
                        {service.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="service-process">
                      <h3>🔄 Quy trình thực hiện</h3>
                      <ol>
                        {service.process.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="service-footer">
                    <Link to="/lien-he" className="btn btn-primary">
                      Đặt Lịch Ngay
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="why-choose">
          <div className="container">
            <h2>Tại Sao Chọn Dịch Vụ Của Chúng Tôi?</h2>
            <div className="why-choose-grid">
              <div className="why-choose-item">
                <div className="why-icon">🏆</div>
                <h3>Chất Lượng Hàng Đầu</h3>
                <p>Sử dụng công nghệ và kỹ thuật tiên tiến nhất từ Hàn Quốc, Nhật Bản</p>
              </div>
              <div className="why-choose-item">
                <div className="why-icon">👨‍⚕️</div>
                <h3>Đội Ngũ Chuyên Gia</h3>
                <p>KTV giàu kinh nghiệm, được đào tạo chuyên sâu và cập nhật xu hướng mới</p>
              </div>
              <div className="why-choose-item">
                <div className="why-icon">🛡️</div>
                <h3>An Toàn Tuyệt Đối</h3>
                <p>Quy trình vô trùng nghiêm ngặt, kim xăm 1 lần sử dụng, đảm bảo an toàn</p>
              </div>
              <div className="why-choose-item">
                <div className="why-icon">💯</div>
                <h3>Bảo Hành Dài Hạn</h3>
                <p>Cam kết bảo hành và chăm sóc sau xăm, hỗ trợ khách hàng 24/7</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section className="pricing">
          <div className="container">
            <h2>Bảng Giá Dịch Vụ</h2>
            <div className="pricing-table">
              <table>
                <thead>
                  <tr>
                    <th>Dịch Vụ</th>
                    <th>Thời Gian</th>
                    <th>Giá Cả</th>
                    <th>Bảo Hành</th>
                    <th>Đặt Lịch</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <div className="table-service">
                          <span className="table-icon">{service.icon}</span>
                          <span>{service.name}</span>
                        </div>
                      </td>
                      <td>{service.duration}</td>
                      <td className="price-cell">{service.price}</td>
                      <td>
                        {service.name.includes('Chân Mày') ? '2 năm' : '1 năm'}
                      </td>
                      <td>
                        <Link to="/lien-he" className="btn btn-sm">
                          Đặt lịch
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
                  

        {/* CTA Section */}
        <section className="services-cta">
          <div className="container">
            <div className="cta-content">
              <h2>🎯 Đặt Lịch Ngay - Nhận Ưu Đãi 20%!</h2>
              <p>📞 Hotline: <strong>0123-456-789</strong> - Tư vấn miễn phí 24/7. Khách hàng mới giảm 20% dịch vụ đầu tiên!</p>
              <div className="special-offers">
                <span className="offer">🎁 Giảm 20% lần đầu</span>
                <span className="offer">📞 Tư vấn miễn phí</span>
                <span className="offer">🛡️ Bảo hành 2 năm</span>
              </div>
              <Link to="/lien-he" className="btn btn-primary btn-large">
                📞 Gọi Ngay: 0123-456-789
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Services