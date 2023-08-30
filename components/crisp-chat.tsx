"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("41ed8708-899e-41c4-879e-e99d892b7a67");
  }, []);

  return null;
};
