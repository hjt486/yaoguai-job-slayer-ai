export const detectFieldType = (input) => {
  if (!input || !(input instanceof Element)) {
    return null;
  }

  const platform = detectPlatform();
  if (!platform || !PLATFORM_PATTERNS[platform]) {
    return null;
  }

  console.log("\n[YaoguaiAI] ========== Field Detection Start ==========");
  
  // Get all possible identifiers
  const identifiers = {
    dataAutomationId: input.getAttribute('data-automation-id'),
    name: input.name,
    id: input.id,
    ariaLabel: input.getAttribute('aria-label'),
    parentDataAutomationId: input.closest('[data-automation-id]')?.getAttribute('data-automation-id')
  };

  // Log the detection attempt
  console.log('[YaoguaiAI] Field Detection:', {
    platform,
    ...identifiers,
    type: input.type,
    tagName: input.tagName
  });
  
  const fields = PLATFORM_PATTERNS[platform].fields;
  // Prioritize fields (country before state)
  const fieldTypes = Object.entries(fields).sort(([a], [b]) => {
    if (a === 'country') return -1;
    if (b === 'country') return 1;
    return 0;
  });

  for (const [fieldType, config] of fieldTypes) {
    const exactMatch = config.selectors.some(selector => {
      // For CSS selectors
      if (selector.startsWith('[') || selector.startsWith('.') || 
          selector.startsWith('#') || selector.startsWith('input') ||
          selector.startsWith('button')) {
        return input.matches(selector);
      }

      // For direct attribute matching (exact matches only)
      return Object.entries(identifiers).some(([_, value]) => {
        if (!value) return false;
        return value.toLowerCase() === selector.toLowerCase();
      });
    });

    if (exactMatch) {
      console.log('[YaoguaiAI] ✅ Exact match found:', {
        fieldType,
        element: input.tagName,
        type: input.type,
        matchedSelector: selector
      });
      console.log("[YaoguaiAI] ========== Field Detection End ==========");
      return { type: fieldType, platform };
    }
  }

  console.log('[YaoguaiAI] ❌ No match found');
  console.log("[YaoguaiAI] ========== Field Detection End ==========");
  return null;
};