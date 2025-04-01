document.addEventListener('DOMContentLoaded', () => {
    const requiredRole = 'admin';
    const storedRole = localStorage.getItem('userRole');
    
    if (storedRole !== requiredRole) {
      localStorage.clear();
      window.location.href = '/login';
    }
  });