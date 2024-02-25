// scroll to top functionality
const scrollUp = document.querySelector("#scroll-up");

scrollUp.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
});


function startTypingAnimation() {
        const typedOutElement = document.querySelector('.typed-out');
        
        const newElement = typedOutElement.cloneNode(true);
        typedOutElement.parentNode.replaceChild(newElement, typedOutElement);
  
        setTimeout(startTypingAnimation, 5000);
      }

      window.addEventListener('load', startTypingAnimation);

      const greetingText = document.querySelector('.greeting-text');
      greetingText.addEventListener('click', () => {
          greetingText.textContent = "Hi there, world!";
      });

      
const navSlide = () => {
        const burger = document.querySelector('.burger');
        const nav = document.querySelector('.navigation');
        const navLinks = document.querySelectorAll('.navigation li');
    
        burger.addEventListener('click', ()=> {
            nav.classList.toggle('nav-active');
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 1.5}s`;
                }
                
            });
    
            burger.classList.toggle('toggle')
        });
    
    
    }
    navSlide();



    