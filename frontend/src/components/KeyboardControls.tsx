'use client';

import { useEffect, useRef } from 'react';
import { useTransformStore } from '@/store/transformStore';

export function KeyboardControls() {
  const updateTransform = useTransformStore((state) => state.updateTransform);
  const keysPressed = useRef(new Set<string>()).current;

  useEffect(() => {
    const moveSpeed = 0.08;
    const rotateSpeed = 0.06;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
      }
      keysPressed.add(event.key.toLowerCase());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keysPressed.delete(event.key.toLowerCase());
    };

    let animationId: number;
    const updateMovement = () => {
      if (keysPressed.size > 0) {
        updateTransform(transform => {
          // Translation
          if (keysPressed.has('w') || keysPressed.has('arrowup')) transform.translation.z -= moveSpeed;
          if (keysPressed.has('s') || keysPressed.has('arrowdown')) transform.translation.z += moveSpeed;
          if (keysPressed.has('a') || keysPressed.has('arrowleft')) transform.translation.x -= moveSpeed;
          if (keysPressed.has('d') || keysPressed.has('arrowright')) transform.translation.x += moveSpeed;
          if (keysPressed.has('q')) transform.translation.y += moveSpeed;
          if (keysPressed.has('e')) transform.translation.y -= moveSpeed;
          if (keysPressed.has('z')) transform.translation.w += moveSpeed;
          if (keysPressed.has('x')) transform.translation.w -= moveSpeed;

          // Rotations
          if (keysPressed.has('i')) transform.rotation_xy += rotateSpeed;
          if (keysPressed.has('k')) transform.rotation_xy -= rotateSpeed;
          if (keysPressed.has('j')) transform.rotation_xz += rotateSpeed;
          if (keysPressed.has('l')) transform.rotation_xz -= rotateSpeed;
          if (keysPressed.has('u')) transform.rotation_xw += rotateSpeed;
          if (keysPressed.has('o')) transform.rotation_xw -= rotateSpeed;
          if (keysPressed.has('7')) transform.rotation_yz += rotateSpeed;
          if (keysPressed.has('8')) transform.rotation_yz -= rotateSpeed;
          if (keysPressed.has('9')) transform.rotation_yw += rotateSpeed;
          if (keysPressed.has('0')) transform.rotation_yw -= rotateSpeed;
          if (keysPressed.has(';')) transform.rotation_zw += rotateSpeed;
          if (keysPressed.has('\'')) transform.rotation_zw -= rotateSpeed;
        });
      }
      animationId = requestAnimationFrame(updateMovement);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: true });
    animationId = requestAnimationFrame(updateMovement);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationId);
    };
  }, [keysPressed, updateTransform]);

  return null;
}
