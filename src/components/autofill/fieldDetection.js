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
  // Prioritize fields and sort by specificity (longer names first to avoid partial matches)
  const fieldTypes = Object.entries(fields).sort(([a], [b]) => {
    // First prioritize country
    if (a === 'country') return -1;
    if (b === 'country') return 1;
    // Then sort by length (longer names first) to avoid partial matches
    // e.g., 'phone_type' should be checked before 'phone'
    return b.length - a.length;
  });

  for (const [fieldType, config] of fieldTypes) {
    const exactMatch = config.selectors.some(selector => {
      // For CSS selectors, keep as-is since they need to work with querySelector
      if (selector.startsWith('[') || selector.startsWith('.') || 
          selector.startsWith('#') || selector.startsWith('input') ||
          selector.startsWith('button')) {
        return input.matches(selector);
      }
  
      // For direct attribute matching - use exact matches only
      return Object.entries(identifiers).some(([key, value]) => {
        if (!value) return false;
        const valueLower = value.toLowerCase();
        const selectorLower = selector.toLowerCase();
  
        // For all identifiers, require exact match
        return valueLower === selectorLower;
      });
    });
  
    if (exactMatch) {
      // Additional type check for phone vs phone_type
      if (fieldType === 'phone' && input.tagName === 'BUTTON') {
        continue; // Skip phone matches on button elements
      }
      if (fieldType === 'phone_type' && input.tagName !== 'BUTTON') {
        continue; // Skip phone_type matches on non-button elements
      }
  
      console.log('[YaoguaiAI] ✅ Exact match found:', {
        fieldType,
        element: input.tagName,
        type: input.type
      });
      console.log("[YaoguaiAI] ========== Field Detection End ==========");
      return { type: fieldType, platform };
    }
  }

  console.log('[YaoguaiAI] ❌ No match found');
  console.log("[YaoguaiAI] ========== Field Detection End ==========");
  return null;
};