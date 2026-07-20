document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Smart Header Scroll (Hide on Scroll Down, Show on Scroll Up & Top) ---
  const header = document.querySelector('header');
  let lastScrollY = window.scrollY;

  const handleHeaderScroll = () => {
    const currentScrollY = window.scrollY;

    // 1. First Header (at top of page): always visible, transparent background
    if (currentScrollY <= 80) {
      header.classList.remove('nav-hidden');
      header.classList.remove('navbar-scrolled');
      lastScrollY = currentScrollY;
      return;
    }

    // 2. Scrolled past top: add scrolled background styling
    header.classList.add('navbar-scrolled');

    // 3. Scrolling Down: Hide the navbar
    if (currentScrollY > lastScrollY && currentScrollY > 120) {
      header.classList.add('nav-hidden');
    } 
    // 4. Scrolling Up: Show the navbar again
    else if (currentScrollY < lastScrollY) {
      header.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll(); // Initialize state

  // --- 1b. Hero Parallax ---
  const hero = document.querySelector('.hero');
  const heroScene = document.querySelector('.hero-scene');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (hero && heroScene && !reduceMotion.matches) {
    let parallaxTicking = false;

    const updateHeroParallax = () => {
      const heroRect = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      if (heroRect.bottom >= 0 && heroRect.top <= viewportHeight) {
        const scrollableDistance = Math.max(hero.offsetHeight - viewportHeight, 1);
        const rawProgress = Math.min(Math.max(-heroRect.top / scrollableDistance, 0), 1);
        
        // Complete the villa landing at 85% of scroll so it locks into place before the body scrolls in
        const progress = Math.min(rawProgress / 0.85, 1);
        const rise = 1 - Math.pow(1 - progress, 2.2);
        
        heroScene.style.setProperty('--hero-progress', progress.toFixed(4));
        heroScene.style.setProperty('--hero-rise', rise.toFixed(4));

        // Staggered fade-in reveals for description paragraph and buttons when scrolling down
        const descOpacity = Math.min(Math.max((rise - 0.22) / 0.4, 0), 1);
        const actionsOpacity = Math.min(Math.max((rise - 0.42) / 0.4, 0), 1);
        heroScene.style.setProperty('--hero-desc-opacity', descOpacity.toFixed(4));
        heroScene.style.setProperty('--hero-actions-opacity', actionsOpacity.toFixed(4));
      }

      parallaxTicking = false;
    };

    const requestHeroParallax = () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateHeroParallax);
        parallaxTicking = true;
      }
    };

    window.addEventListener('scroll', requestHeroParallax, { passive: true });
    window.addEventListener('resize', requestHeroParallax);
    updateHeroParallax();
  }


  // --- 2. Scroll Entry/Exit ViewTimeline Fallback ---
  const checkViewSupport = () => {
    return CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
  };

  if (!checkViewSupport()) {
    // IntersectionObserver fallback for fade-in animations
    const revealElements = document.querySelectorAll('.reveal-effect');
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -80px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-effect-active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      el.classList.add('js-reveal');
      revealObserver.observe(el);
    });
  }


  // --- 3. Mobile Hamburger Menu Toggle ---
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('nav');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileToggle.classList.toggle('active');

      const spans = mobileToggle.querySelectorAll('span');
      if (mobileToggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -7px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close mobile menu when clicking a link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          mobileToggle.classList.remove('active');
          const spans = mobileToggle.querySelectorAll('span');
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
        }
      });
    });
  }


  // --- 4. Villa Showcase Carousel (Slicing Spaces) ---
  const track = document.querySelector('.villas-track');
  const cards = document.querySelectorAll('.villa-card');
  const prevBtn = document.querySelector('.villas-nav-btn.prev');
  const nextBtn = document.querySelector('.villas-nav-btn.next');

  if (track && cards.length > 0 && prevBtn && nextBtn) {
    let index = 0;

    const getCardsPerView = () => {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    const updateCarousel = () => {
      const cardsPerView = getCardsPerView();
      const maxIndex = Math.max(0, cards.length - cardsPerView);
      if (index > maxIndex) index = maxIndex;
      if (index < 0) index = 0;

      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
      const amountToMove = (cardWidth + gap) * index;

      track.style.transform = `translateX(-${amountToMove}px)`;

      // Update button opacity
      prevBtn.style.opacity = index === 0 ? '0.3' : '1';
      prevBtn.style.cursor = index === 0 ? 'default' : 'pointer';
      nextBtn.style.opacity = index === maxIndex ? '0.3' : '1';
      nextBtn.style.cursor = index === maxIndex ? 'default' : 'pointer';
    };

    nextBtn.addEventListener('click', () => {
      const cardsPerView = getCardsPerView();
      if (index < cards.length - cardsPerView) {
        index++;
        updateCarousel();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (index > 0) {
        index--;
        updateCarousel();
      }
    });

    window.addEventListener('resize', updateCarousel);
    setTimeout(updateCarousel, 150);
  }


  // --- 5. Dynamic Space Details Modal (Dialog) ---
  const spaceData = {
    'heritage-salon': {
      name: "The Heritage Cane Salon",
      location: "Banjara Hills",
      tag: "Ground Floor Salon",
      dimensions: "950 sq. ft.",
      image: "images/salon.jpg",
      desc: "A beautifully styled heritage living salon featuring signature woven cane armchairs, a premium vintage Persian area rug, polished marble floors, and an arched door leading to the gardens. This space radiates old-world warmth, perfect for intimate conversations and reading.",
      amenities: ["Bespoke Cane Armchairs", "Vintage Persian Rug", "Arched Doorways", "Polished Marble Floor", "Courtyard Views", "Ambient Warm Lighting"]
    },
    'classic-lounge': {
      name: "The Classic Living Lounge",
      location: "Banjara Hills",
      tag: "Main Lounge",
      dimensions: "1,200 sq. ft.",
      image: "images/lounge.jpg",
      desc: "The primary living lounge of the cabin, designed for family gathering and entertainment. It features comfortable beige fabric sofa sets, a central solid teak coffee table, custom wooden media consoles, soft cream drapes, and smart temperature controls.",
      amenities: ["Plush Fabric Sofas", "Teak Coffee Table", "Wood Media Console", "Cream Drapes", "Climate Control (AC)", "Indirect LED Ceiling Lights"]
    },
    'stair-landing': {
      name: "The Staircase Landing Hall",
      location: "Banjara Hills",
      tag: "First Floor Transition",
      dimensions: "600 sq. ft.",
      image: "images/hallway.jpg",
      desc: "A bright transition hall connecting the private bedrooms on the first floor. It features a custom-designed black wrought-iron staircase railing, a cozy side couch, polished marble floors, and tall classic timber and glass display cabinets holding selected artifacts.",
      amenities: ["Wrought-Iron Railing", "Teak Glass Cabinet", "Lounge Couch", "Polished Marble Floor", "First Floor Balcony Access", "Natural Daylighting"]
    },
    'scenic-sitting': {
      name: "The Scenic Sitting Room",
      location: "Banjara Hills",
      tag: "Garden Sitting Area",
      dimensions: "850 sq. ft.",
      image: "images/sitting.jpg",
      desc: "A peaceful private sitting room separated by a classic white-paneled window frame partition. Equipped with comfortable olive-green fabric sofa seating, French timber-and-glass doors opening directly to the private garden balcony, and polished marble flooring.",
      amenities: ["Paneled Glass Partition", "Green Sofa Seating", "French Timber Doors", "Polished Marble Floor", "Lakeside Balcony Access", "Private Seclusion"]
    }
  };

  const dialogOverlay = document.querySelector('.dialog-overlay');
  const dialogClose = document.querySelector('.dialog-close');

  if (dialogOverlay && dialogClose) {
    document.querySelectorAll('.explore-space-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const spaceId = btn.getAttribute('data-space-id');
        const space = spaceData[spaceId];

        if (space) {
          // Populate details
          dialogOverlay.querySelector('.villa-loc').textContent = `${space.location} • ${space.tag}`;
          dialogOverlay.querySelector('.dialog-header h2').textContent = space.name;
          const modalImg = dialogOverlay.querySelector('.dialog-image img');
          modalImg.classList.remove('loaded');
          modalImg.src = space.image;
          modalImg.alt = space.name;
          if (modalImg.complete) {
            modalImg.classList.add('loaded');
          } else {
            modalImg.onload = () => {
              modalImg.classList.add('loaded');
            };
            modalImg.onerror = () => {
              modalImg.classList.add('loaded');
            };
          }
          dialogOverlay.querySelector('.dialog-features p').textContent = space.desc;
          
          // Re-label Price to Dimensions
          dialogOverlay.querySelector('.dialog-price span.label').textContent = "Dimensions";
          dialogOverlay.querySelector('.dialog-price .value').textContent = space.dimensions;

          // Render amenities list
          const list = dialogOverlay.querySelector('.dialog-amenities-list');
          list.innerHTML = '';
          space.amenities.forEach(amenity => {
            const li = document.createElement('li');
            li.innerHTML = `
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#C5A059" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <span>${amenity}</span>
            `;
            list.appendChild(li);
          });

          // Show modal
          dialogOverlay.classList.add('active');
          document.body.style.overflow = 'hidden'; // Lock background scroll
        }
      });
    });

    const closeModal = () => {
      dialogOverlay.classList.remove('active');
      document.body.style.overflow = 'auto'; // Unlock background scroll
    };

    dialogClose.addEventListener('click', closeModal);
    dialogOverlay.addEventListener('click', (e) => {
      if (e.target === dialogOverlay) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dialogOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }


  // --- 6. Booking Inquiry Form Validation ---
  const bookingForm = document.querySelector('.booking-form');
  const feedback = document.querySelector('.form-feedback');

  if (bookingForm && feedback) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('book-name').value.trim();
      const email = document.getElementById('book-email').value.trim();
      const guests = document.getElementById('book-guests').value;

      if (name && email) {
        feedback.textContent = `Thank you, ${name}! Your booking inquiry for a luxury stay with ${guests} guests at Waterfront Cabin, Banjara Hills has been submitted. Our guest relationships team will contact you shortly.`;
        feedback.className = 'form-feedback success';
        bookingForm.reset();
        
        // Scroll feedback into view smoothly
        feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Show the element in case it was hidden previously
        feedback.style.display = 'block';
        
        // Hide success message after 10 seconds
        setTimeout(() => {
          feedback.style.display = 'none';
        }, 10000);
      }
    });
  }


  // --- 7. Smooth scrolling for internal anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // Get header height to offset scroll
        const offset = 80; // height of sticky bar
        
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });


  // --- 8. Skeleton Loader Image Fade-in ---
  const mediaElements = document.querySelectorAll('img, .space-bg');
  mediaElements.forEach(el => {
    if (el.closest('.dialog-overlay')) return; // Handled dynamically on modal open
    
    if (el.tagName === 'IMG') {
      if (el.complete) {
        el.classList.add('loaded');
      } else {
        el.addEventListener('load', () => {
          el.classList.add('loaded');
        });
        el.addEventListener('error', () => {
          el.classList.add('loaded');
        });
      }
    } else {
      const bgStyle = window.getComputedStyle(el).backgroundImage;
      const match = bgStyle.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        const tempImg = new Image();
        tempImg.src = match[1];
        tempImg.onload = () => {
          el.classList.add('loaded');
        };
        tempImg.onerror = () => {
          el.classList.add('loaded');
        };
      } else {
        el.classList.add('loaded');
      }
    }
  });

  // --- 9. Villa 3D Perspective Coverflow Gallery ---
  const gallerySection = document.querySelector('#gallery-slider');
  if (gallerySection) {
    const cards = gallerySection.querySelectorAll('.coverflow-card');
    const dots = gallerySection.querySelectorAll('.dot-btn');
    const prevBtn = gallerySection.querySelector('.prev-btn');
    const nextBtn = gallerySection.querySelector('.next-btn');
    const activeTag = gallerySection.querySelector('.active-tag');
    const activeHeading = gallerySection.querySelector('.active-heading');
    let currentIndex = 0;
    let autoplayTimer = null;
    const totalCards = cards.length;

    const slideInfo = [
      { tag: "Beige Living Salon", title: "Classic Living Salon & Persian Area Rug" },
      { tag: "Scenic Garden Lounge", title: "Green Sofa Lounge & Cane Drawers" },
      { tag: "Lush Window View", title: "Staircase Window & Indoor Tropical Garden" },
      { tag: "Grand Staircase", title: "Crystal Baluster Staircase & Art Statues" },
      { tag: "Heritage Nook", title: "Heritage Cane Corner Nook & Vintage Lamp" },
      { tag: "Classic Lounge", title: "Classic Living Lounge & Media Console" },
      { tag: "Master Suite", title: "Teak & Cane Master Suite" }
    ];

    const updateCoverflow = (activeIndex) => {
      if (activeIndex < 0) activeIndex = totalCards - 1;
      if (activeIndex >= totalCards) activeIndex = 0;
      currentIndex = activeIndex;

      const cardSpacing = window.innerWidth <= 768 ? 120 : 165;

      cards.forEach((card, i) => {
        let diff = i - activeIndex;

        // Circular wrapping for clean continuous loop
        if (diff > totalCards / 2) diff -= totalCards;
        if (diff < -totalCards / 2) diff += totalCards;

        const absDiff = Math.abs(diff);

        if (diff === 0) {
          card.style.transform = `translateX(-50%) translateZ(100px) rotateY(0deg) scale(1.06)`;
          card.style.opacity = '1';
          card.style.zIndex = '20';
          card.style.filter = 'none';
          card.classList.add('active');
        } else {
          const sign = diff > 0 ? 1 : -1;
          const translateX = -50 + (sign * (cardSpacing * Math.pow(absDiff, 0.82)));
          const rotateY = -sign * (24 + (absDiff - 1) * 14);
          const translateZ = 30 - (absDiff * 75);
          const scale = Math.max(0.6, 0.9 - (absDiff - 1) * 0.12);
          const opacity = Math.max(0.35, 0.95 - (absDiff - 1) * 0.22);
          const zIndex = 20 - absDiff;

          card.style.transform = `translateX(calc(${translateX.toFixed(1)}%)) translateZ(${translateZ.toFixed(1)}px) rotateY(${rotateY.toFixed(1)}deg) scale(${scale.toFixed(2)})`;
          card.style.opacity = opacity.toFixed(2);
          card.style.zIndex = zIndex.toString();
          card.style.filter = absDiff > 1 ? 'brightness(0.78)' : 'brightness(0.92)';
          card.classList.remove('active');
        }
      });

      if (activeTag && activeHeading && slideInfo[activeIndex]) {
        activeTag.textContent = slideInfo[activeIndex].tag;
        activeHeading.textContent = slideInfo[activeIndex].title;
      }

      dots.forEach((dot, i) => {
        if (i === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayTimer = setInterval(nextCoverflow, 2500);
    };

    const stopAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
    };

    const resetAutoplayOnInteraction = () => {
      stopAutoplay();
      setTimeout(startAutoplay, 3500);
    };

    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        updateCoverflow(i);
        resetAutoplayOnInteraction();
      });
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        updateCoverflow(idx);
        resetAutoplayOnInteraction();
      });
    });

    const nextCoverflow = () => updateCoverflow(currentIndex + 1);
    const prevCoverflow = () => updateCoverflow(currentIndex - 1);

    if (nextBtn) nextBtn.addEventListener('click', () => {
      nextCoverflow();
      resetAutoplayOnInteraction();
    });

    if (prevBtn) prevBtn.addEventListener('click', () => {
      prevCoverflow();
      resetAutoplayOnInteraction();
    });

    // Start continuous auto scrolling
    startAutoplay();

    // Touch Swipe
    let touchStartX = 0;
    gallerySection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    gallerySection.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) {
        nextCoverflow();
        resetAutoplayOnInteraction();
      } else if (touchEndX - touchStartX > 40) {
        prevCoverflow();
        resetAutoplayOnInteraction();
      }
    }, { passive: true });

    updateCoverflow(0);
  }

});
