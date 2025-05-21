// src/components/SmartFarmAdvisor/ui/ContextualTip.tsx
import React, { FC } from "react";
import { ContextualTipProps } from "../../../../types/interface";

const ContextualTip: FC<ContextualTipProps> = ({ children }) => (
  <div className="mt-4 rounded-md border border-sky-700 bg-sky-900/30 p-3 text-sm text-sky-300">
    <span className="font-bold">(i) Tip:</span> {children}
  </div>
);

export default ContextualTip;
