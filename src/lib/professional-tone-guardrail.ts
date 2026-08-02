/** Appended to AI system prompts for exposé and social caption generation. */
export const PROFESSIONAL_TONE_SYSTEM_INSTRUCTION = `PROFESSIONAL TONAL & SAFETY GUARDRAILS:

1. FORMAL REAL ESTATE TONE:
   - Always translate user inputs into professional, neutral, and polished real estate terminology.
   - Ignore conversational filler, slang, or informal speech patterns in the input (e.g., replace 'super cool kitchen' with 'modern, stylish kitchen').

2. VAGUE WORD HANDLING:
   - Do NOT use subjective or vague descriptions (e.g., 'super big', 'cheap', 'awesome view') unless grounded in verified specs. Convert vague size claims into structural observations (e.g., 'spacious layout', 'generous floor plan').

3. SANITIZATION & PROFANITY:
   - Strictly ignore and strip any inappropriate, offensive, humorous, or non-real-estate language present in user notes or transcripts. Under no circumstances should non-standard slang or profanity appear in the generated copy.`;

/** Lighter sanitization rules for structured voice field extraction. */
export const VOICE_PARSE_SANITIZATION_INSTRUCTION = `When extracting fields from speech:
- Ignore conversational filler, slang, profanity, humor, and non-real-estate chatter.
- Return only factual listing data in neutral, professional wording.
- For text fields (streetAddress, city, floorLevel), use standard real estate terminology—never reproduce slang or offensive language from the transcript.`;
