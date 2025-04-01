document.addEventListener('DOMContentLoaded', () => {
    const requiredRole = 'counselor';
    const storedRole = localStorage.getItem('userRole');
    
    if (storedRole !== requiredRole) {
      localStorage.clear();
      window.location.href = '/login';
    }
  });