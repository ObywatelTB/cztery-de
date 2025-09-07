import { create } from 'zustand';
import { Transform4D, Vector4D } from '@/types/4d';

const initialTransform: Transform4D = {
  rotation_xy: 0,
  rotation_xz: 0,
  rotation_xw: 0,
  rotation_yz: 0,
  rotation_yw: 0,
  rotation_zw: 0,
  translation: { x: 0, y: 0, z: 0, w: 0 },
};

interface TransformState {
  transform: Transform4D;
  // This function allows direct mutation for performance within the animation loop
  updateTransform: (updateFn: (transform: Transform4D) => void) => void;
}

export const useTransformStore = create<TransformState>((set, get) => ({
  transform: initialTransform,
  updateTransform: (updateFn) => {
    const newTransform = { ...get().transform };
    updateFn(newTransform);
    set({ transform: newTransform });
  },
}));

// A hook for the UI to subscribe to changes.
// This is now the same as the main hook, but we keep it for clarity.
export const useTransformForUI = () => {
  const transform = useTransformStore((state) => state.transform);
  return transform;
};
