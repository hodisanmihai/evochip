"use client";

import React from "react";
import Background from "./Background";
const HeroPage = (isisVisible: { isVisible: boolean }) => {
  return (
    <div>
      <Background isVisible={isisVisible.isVisible} />
    </div>
  );
};

export default HeroPage;
