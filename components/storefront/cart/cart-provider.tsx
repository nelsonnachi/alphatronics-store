"use client";

import { useState } from "react";

import { CartButton } from "./cart-button";
import { CartDrawer } from "./cart-drawer";

export function CartProvider() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CartButton
        onClick={() => setOpen(true)}
      />

      <CartDrawer
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}