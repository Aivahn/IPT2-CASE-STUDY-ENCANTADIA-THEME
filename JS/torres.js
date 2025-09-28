   document.querySelectorAll('.soul-gem').forEach(gem => {
      const icon = gem.querySelector('.soul-gem-icon');
      if (icon) {
        gem.addEventListener('mouseenter', () => {
          icon.style.transform = (icon.style.transform || '') + ' scale(1.1) rotate(5deg)';
        });
        
        gem.addEventListener('mouseleave', () => {
          icon.style.transform = icon.style.transform.replace(/scale\([^)]*\)/, '').replace(/rotate\([^)]*\)/, '');
        });
      }
    });

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const gems = document.querySelectorAll('.soul-gem-icon');
      
      gems.forEach((gem, index) => {
        const rotation = scrolled * 0.05 * (index + 1);
        const currentTransform = gem.style.transform || '';
        const newTransform = currentTransform.replace(/rotate\([^)]*\)/, '') + ` rotate(${rotation}deg)`;
        gem.style.transform = newTransform;
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });