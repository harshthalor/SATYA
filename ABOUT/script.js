document.addEventListener("DOMContentLoaded", function() {
    
    // 1. ScrollSpy (Active Navbar State)
    const sections = document.querySelectorAll("section");
    const navLi = document.querySelectorAll(".nav-links .nav-item");

    window.addEventListener('scroll', () => {
        let current = "";
        
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Adjust offset for navbar height (approx 100px)
            if (pageYOffset >= sectionTop - 200) { 
                current = section.getAttribute("id");
            }
        });

        navLi.forEach((li) => {
            li.classList.remove("active");
            // Match href attribute to current section id
            if (li.getAttribute("href") === `#${current}`) {
                li.classList.add("active");
            }
        });
    });

    // 2. Smooth Reveal Animation (Intersection Observer)
    const observerOptions = {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                
                // Trigger counter animation if the element is the stats section
                if (entry.target.querySelector('.counter')) {
                    startCounters(entry.target);
                }
                
                // Optional: Stop observing once shown (for performance)
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll(".hidden-el");
    hiddenElements.forEach((el) => observer.observe(el));

    // 3. Number Counter Animation (for 0% -> 100%)
    function startCounters(section) {
        const counters = section.querySelectorAll('.counter');
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps

            let current = 0;
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            updateCounter();
        });
    }

    // 4. Mobile Menu Toggle (Basic implementation)
    const menuIcon = document.querySelector('.mobile-menu-icon');
    const navLinks = document.querySelector('.nav-links');

    if(menuIcon) {
        menuIcon.addEventListener('click', () => {
            // Simple toggle for demo purposes. 
            // In a real app, you'd toggle a class like 'nav-open' in CSS
            if (navLinks.style.display === 'flex') {
                navLinks.style.display = 'none';
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
            }
        });
    }
});