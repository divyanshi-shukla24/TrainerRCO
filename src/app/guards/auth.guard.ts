import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  // Yahan apna authentication check laga sakte hain (jaise localStorage token)
  const isAuthenticated = true; // Temporary check

  if (isAuthenticated) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};