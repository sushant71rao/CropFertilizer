// src/components/SmartFarmAdvisor/ui/EducationalSnippet.tsx
import React, { FC, useState } from "react";
import { EducationalSnippetProps } from "../../../../types/interface";

const EducationalSnippet: FC<EducationalSnippetProps> = ({
  title,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Learn more about ${title}`}
        className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-xs font-bold text-white transition-colors hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        ?
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 z-20 mb-2 w-60 -translate-x-1/2 transform rounded-lg bg-gray-700 p-3 text-sm text-white shadow-xl ring-1 ring-black ring-opacity-5">
          <h4 className="mb-1 font-semibold text-sky-300">{title}</h4>
          <p className="text-gray-200">{children}</p>
        </div>
      )}
    </div>
  );
};

export default EducationalSnippet;
